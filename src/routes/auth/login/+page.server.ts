import { redirect } from '@sveltejs/kit'
import { getUserFromEmail, getUserPasswordHash } from '$lib/server/auth/user'
import { RefillingTokenBucket, Throttler } from '$lib/server/auth/rateLimit'
import { verifyPasswordHash } from '$lib/server/auth/password'
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie
} from '$lib/server/auth/session'

import type { SessionFlags } from '$lib/server/auth/session'
import type { Actions, PageServerLoadEvent, RequestEvent } from './$types'
import { setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from './schema'

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

const throttler = new Throttler([0, 1, 2, 4, 8, 16, 30, 60, 180, 300])
const ipBucket = new RefillingTokenBucket(20, 1)

const actions: Actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(formSchema))

    // TODO: Assumes X-Forwarded-For is always included.
    const clientIP = event.request.headers.get('X-Forwarded-For')
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
      return setError(form, 'email', 'Too many requests')
    }

    const { email, password } = form.data

    if (!form.valid) {
      return setError(form, 'email', 'Invalid email or password')
    }

    const user = await getUserFromEmail(email)
    if (user === null) {
      return setError(form, 'email', "We couldn't find your account")
    }

    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
      return setError(form, 'email', 'Too many requests')
    }

    if (!throttler.consume(user.id)) {
      return setError(form, 'email', 'Too many requests')
    }

    const passwordHash = await getUserPasswordHash(user.id)
    const validPassword = await verifyPasswordHash(passwordHash, password)

    if (!validPassword) {
      return setError(form, 'password', 'Invalid password')
    }

    throttler.reset(user.id)
    const sessionFlags: SessionFlags = {
      twoFactorVerified: false
    }

    const sessionToken = generateSessionToken()
    const session = await createSession(sessionToken, user.id, sessionFlags)
    console.log('Session created:', session)
    setSessionTokenCookie(event, sessionToken, session.expiresAt)

    if (!user.emailVerified) {
      return redirect(302, '/auth/verify')
    }
    if (!user.registered2FA) {
      return redirect(302, '/auth/2fa/setup')
    }
    return redirect(302, '/auth/2fa')
  }
}

export { load, actions }
