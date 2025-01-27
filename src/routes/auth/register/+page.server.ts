import { redirect } from '@sveltejs/kit'
import { checkEmailAvailability } from '$lib/server/auth/email'
import { createUser, checkUsernameAvailability } from '$lib/server/auth/user'
import { RefillingTokenBucket } from '$lib/server/auth/rateLimit'
import { verifyPasswordStrength } from '$lib/server/auth/password'
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie
} from '$lib/server/auth/session'
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie
} from '$lib/server/auth/emailVerification'

import type { SessionFlags } from '$lib/server/auth/session'
import type { Actions, PageServerLoadEvent, RequestEvent } from './$types'
import { setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from './schema'

const ipBucket = new RefillingTokenBucket(3, 10)

const load = async (event: PageServerLoadEvent) => {
  if (event.locals.session !== null && event.locals.user !== null) {
    if (!event.locals.user.emailVerified) {
      return redirect(302, '/auth/verify')
    }
    if (!event.locals.user.registered2FA) {
      return redirect(302, '/auth/2fa/setup')
    }
    if (!event.locals.session.twoFactorVerified) {
      return redirect(302, '/auth/2fa')
    }
    return redirect(302, '/')
  }
  return {
    form: await superValidate(zod(formSchema))
  }
}

const actions: Actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(formSchema))

    // TODO: Assumes X-Forwarded-For is always included.
    const clientIP = event.request.headers.get('X-Forwarded-For')
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
      return setError(form, 'email', 'Too many requests')
    }

    const { email, username, password } = form.data

    if (!form.valid) {
      return setError(form, 'email', 'Invalid or missing fields')
    }

    const emailAvailable = checkEmailAvailability(email)
    if (!emailAvailable) {
      return setError(form, 'email', 'Email already in use')
    }

    const usernameAvailable = checkUsernameAvailability(username)
    if (!usernameAvailable) {
      return setError(form, 'username', 'Username already in use')
    }

    const strongPassword = await verifyPasswordStrength(password)
    if (!strongPassword) {
      return setError(form, 'password', 'Password is too weak')
    }

    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
      return setError(form, 'email', 'Too many requests')
    }

    const user = await createUser(email, username, password)
    const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email)
    sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code)
    setEmailVerificationRequestCookie(event, emailVerificationRequest)

    const sessionFlags: SessionFlags = {
      twoFactorVerified: false
    }

    const sessionToken = generateSessionToken()
    const session = await createSession(sessionToken, user.id, sessionFlags)
    setSessionTokenCookie(event, sessionToken, session.expiresAt)
    throw redirect(302, '/auth/2fa/setup')
  }
}

export { load, actions }
