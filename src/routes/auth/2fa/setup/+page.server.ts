import { createTOTPKeyURI, verifyTOTP } from '@oslojs/otp'
import { redirect } from '@sveltejs/kit'
import { decodeBase64, encodeBase64 } from '@oslojs/encoding'
import { updateUserTOTPKey } from '$lib/server/auth/user'
import { setSessionAs2FAVerified } from '$lib/server/auth/session'
import { RefillingTokenBucket } from '$lib/server/auth/rateLimit'

import type { Actions, RequestEvent } from './$types'
import { setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from './schema'

const totpUpdateBucket = new RefillingTokenBucket(3, 60 * 10)

const load = async (event: RequestEvent) => {
  if (event.locals.session === null || event.locals.user === null) {
    return redirect(302, '/auth/login')
  }

  if (!event.locals.user.emailVerified) {
    return redirect(302, '/auth/verify')
  }

  if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
    return redirect(302, '/auth/2fa')
  }

  const totpKey = new Uint8Array(20)
  crypto.getRandomValues(totpKey)
  const encodedTOTPKey = encodeBase64(totpKey)
  const keyURI = createTOTPKeyURI('Demo', event.locals.user.username, totpKey, 30, 6)

  return {
    encodedTOTPKey,
    keyURI,
    form: await superValidate(zod(formSchema), {
      defaults: {
        key: encodedTOTPKey,
        code: ''
      }
    })
  }
}

const actions: Actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(formSchema))

    if (event.locals.session === null || event.locals.user === null) {
      return setError(form, 'code', 'Forbidden')
    }
    if (!event.locals.user.emailVerified) {
      return setError(form, 'code', 'Forbidden')
    }

    if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
      return setError(form, 'code', 'Forbidden')
    }

    if (!totpUpdateBucket.check(event.locals.user.id, 1)) {
      return setError(form, 'code', 'Too many requests')
    }

    if (!form.valid) {
      return setError(form, 'code', 'Invalid or missing fields')
    }

    const encodedKey = form.data.key
    const code = form.data.code

    let key: Uint8Array

    try {
      key = decodeBase64(encodedKey)
    } catch {
      return setError(form, 'key', 'Invalid key')
    }

    if (key.byteLength !== 20) {
      return setError(form, 'key', 'Invalid key')
    }

    if (!totpUpdateBucket.consume(event.locals.user.id, 1)) {
      return setError(form, 'code', 'Too many requests')
    }

    if (!verifyTOTP(key, 30, 6, code)) {
      return setError(form, 'code', 'Invalid code')
    }

    await updateUserTOTPKey(event.locals.session.userId, key)
    await setSessionAs2FAVerified(event.locals.session.id)
    return redirect(302, '/auth/recovery')
  }
}

export { load, actions }
