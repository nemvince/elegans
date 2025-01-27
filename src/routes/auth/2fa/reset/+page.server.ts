import { recoveryCodeBucket, resetUser2FAWithRecoveryCode } from '$lib/server/auth/2fa'
import { redirect } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { formSchema } from './schema'
import { zod } from 'sveltekit-superforms/adapters'

import type { Actions, RequestEvent } from './$types'

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

    if (!recoveryCodeBucket.check(event.locals.user.id, 1)) {
      return setError(form, 'code', 'Too many requests')
    }

    if (!form.valid) {
      return setError(form, 'code', 'Invalid or missing fields')
    }

    const code = form.data.code

    if (!recoveryCodeBucket.consume(event.locals.user.id, 1)) {
      return setError(form, 'code', 'Too many requests')
    }

    const valid = await resetUser2FAWithRecoveryCode(event.locals.user.id, code)

    if (!valid) {
      return setError(form, 'code', 'Invalid code')
    }

    recoveryCodeBucket.reset(event.locals.user.id)
    return redirect(302, '/auth/2fa/setup')
  }
}

export { load, actions }
