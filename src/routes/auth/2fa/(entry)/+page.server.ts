import { totpBucket } from '$lib/server/auth/2fa'
import { redirect } from '@sveltejs/kit'
import { getUserTOTPKey } from '$lib/server/auth/user'
import { verifyTOTP } from '@oslojs/otp'
import { setSessionAs2FAVerified } from '$lib/server/auth/session'
import { formSchema } from './schema'

import type { Actions, RequestEvent } from './$types'
import { setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

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
  if (event.locals.session.twoFactorVerified) {
    console.log('Already verified')
    return redirect(302, '/')
  }
  return {
    form: await superValidate(zod(formSchema))
  }
}

const actions: Actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(formSchema))

    if (event.locals.session === null || event.locals.user === null) {
      return setError(form, 'code', 'Forbidden')
    }

    if (
      !event.locals.user.emailVerified ||
      !event.locals.user.registered2FA ||
      event.locals.session.twoFactorVerified
    ) {
      return setError(form, 'code', 'Forbidden')
    }

    if (!totpBucket.check(event.locals.user.id, 1)) {
      return setError(form, 'code', 'Too many requests')
    }

    const code = form.data.code

    if (!form.valid) {
      return setError(form, 'code', 'Invalid code')
    }

    if (!totpBucket.consume(event.locals.user.id, 1)) {
      return setError(form, 'code', 'Too many requests')
    }

    const totpKey = await getUserTOTPKey(event.locals.user.id)
    if (totpKey === null) {
      return setError(form, 'code', 'Invalid code')
    }

    if (!verifyTOTP(totpKey, 30, 6, code)) {
      return setError(form, 'code', 'Invalid code')
    }

    totpBucket.reset(event.locals.user.id)
    await setSessionAs2FAVerified(event.locals.session.id)
    return redirect(302, '/')
  }
}

export { load, actions }
