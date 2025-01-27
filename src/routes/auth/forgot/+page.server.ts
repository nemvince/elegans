import { verifyEmailInput } from '$lib/server/auth/email'
import { getUserFromEmail } from '$lib/server/auth/user'
import {
  createPasswordResetSession,
  invalidateUserPasswordResetSessions,
  sendPasswordResetEmail,
  setPasswordResetSessionTokenCookie
} from '$lib/server/auth/passwordReset'
import { RefillingTokenBucket } from '$lib/server/auth/rateLimit'
import { generateSessionToken } from '$lib/server/auth/session'
import { fail, redirect } from '@sveltejs/kit'

import type { Actions, RequestEvent } from './$types'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from './schema'

const load = async () => {
  return {
    form: await superValidate(zod(formSchema))
  }
}

const ipBucket = new RefillingTokenBucket(3, 60)
const userBucket = new RefillingTokenBucket(3, 60)

const actions: Actions = {
  default: async (event: RequestEvent) => {
    let clientIP = event.request.headers.get('X-Forwarded-For')
    if (clientIP === null) {
      clientIP = event.getClientAddress()
    }
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
      return fail(429, {
        message: 'Too many requests',
        email: ''
      })
    }

    const formData = await event.request.formData()
    const email = formData.get('email')
    if (typeof email !== 'string') {
      return fail(400, {
        message: 'Invalid or missing fields',
        email: ''
      })
    }
    if (!verifyEmailInput(email)) {
      return fail(400, {
        message: 'Invalid email',
        email
      })
    }
    const user = await getUserFromEmail(email)
    if (user === null) {
      return fail(400, {
        message: 'Account does not exist',
        email
      })
    }
    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
      return fail(400, {
        message: 'Too many requests',
        email
      })
    }
    if (!userBucket.consume(user.id, 1)) {
      return fail(400, {
        message: 'Too many requests',
        email
      })
    }
    invalidateUserPasswordResetSessions(user.id)
    const sessionToken = generateSessionToken()
    const session = await createPasswordResetSession(sessionToken, user.id, user.email)
    sendPasswordResetEmail(session.email, session.code)
    setPasswordResetSessionTokenCookie(event, sessionToken, session.expiresAt)
    return redirect(302, '/auth/reset/verify')
  }
}

export { load, actions }
