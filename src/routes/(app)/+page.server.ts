import { fail, redirect } from '@sveltejs/kit'
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth/session'

import type { Actions, PageServerLoadEvent, RequestEvent } from './$types'

const load = (event: PageServerLoadEvent) => {
  if (event.locals.session === null || event.locals.user === null) {
    return redirect(302, '/auth/login')
  }
  if (!event.locals.user.emailVerified) {
    return redirect(302, '/auth/verifyEmail')
  }
  if (!event.locals.user.registered2FA) {
    return redirect(302, '/auth/2fa/setup')
  }
  if (!event.locals.session.twoFactorVerified) {
    return redirect(302, '/auth/2fa')
  }
  return {
    user: event.locals.user
  }
}

const actions: Actions = {
  default: async (event: RequestEvent) => {
    if (event.locals.session === null) {
      return fail(401, {
        message: 'Not authenticated'
      })
    }
    await invalidateSession(event.locals.session.id)
    deleteSessionTokenCookie(event)
    return redirect(302, '/auth/login')
  }
}

export { load, actions }
