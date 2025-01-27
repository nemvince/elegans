import { getUserRecoveryCode } from '$lib/server/auth/user'
import { redirect } from '@sveltejs/kit'

import type { RequestEvent } from './$types'

const load = async (event: RequestEvent) => {
  if (event.locals.session === null || event.locals.user === null) {
    return redirect(302, '/auth/login')
  }
  if (!event.locals.user.emailVerified) {
    return redirect(302, '/auth/verify')
  }
  if (!event.locals.user.registered2FA) {
    return redirect(302, '/auth/2fa/setup')
  }
  if (!event.locals.session.twoFactorVerified) {
    return redirect(302, '/auth/2fa')
  }
  const recoveryCode = await getUserRecoveryCode(event.locals.user.id)
  return {
    recoveryCode
  }
}

export { load }
