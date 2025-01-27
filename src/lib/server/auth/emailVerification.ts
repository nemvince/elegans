import { generateRandomOTP } from '$lib/server/utils'
import { ExpiringTokenBucket } from '$lib/server/auth/rateLimit'
import { encodeBase32 } from '@oslojs/encoding'
import prisma from '$lib/server/prisma'

import type { RequestEvent } from '@sveltejs/kit'

const getUserEmailVerificationRequest = async (
  userId: string,
  id: string
): Promise<EmailVerificationRequest | null> => {
  const row = await prisma.emailVerificationRequest.findUnique({
    where: {
      id,
      userId
    }
  })

  if (row === null) {
    return null
  }

  const request: EmailVerificationRequest = {
    id: row.id,
    userId: row.userId,
    code: row.code,
    email: row.email,
    expiresAt: row.expiresAt
  }
  return request
}

const createEmailVerificationRequest = async (
  userId: string,
  email: string
): Promise<EmailVerificationRequest> => {
  deleteUserEmailVerificationRequest(userId)
  const idBytes = new Uint8Array(20)
  crypto.getRandomValues(idBytes)
  const id = encodeBase32(idBytes).toLowerCase()

  const code = generateRandomOTP()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10)

  await prisma.emailVerificationRequest.create({
    data: {
      id,
      userId,
      code,
      email,
      expiresAt
    }
  })

  const request: EmailVerificationRequest = {
    id,
    userId,
    code,
    email,
    expiresAt
  }
  return request
}

const deleteUserEmailVerificationRequest = async (userId: string): Promise<void> => {
  await prisma.emailVerificationRequest.deleteMany({
    where: {
      userId
    }
  })
}

const sendVerificationEmail = (email: string, code: string): void => {
  console.log(`To ${email}: Your verification code is ${code}`)
}

const setEmailVerificationRequestCookie = (
  event: RequestEvent,
  request: EmailVerificationRequest
): void => {
  event.cookies.set('email_verification', request.id, {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    expires: request.expiresAt
  })
}

const deleteEmailVerificationRequestCookie = (event: RequestEvent): void => {
  event.cookies.set('email_verification', '', {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 0
  })
}

const getUserEmailVerificationRequestFromRequest = async (
  event: RequestEvent
): Promise<EmailVerificationRequest | null> => {
  if (event.locals.user === null) {
    return null
  }
  const id = event.cookies.get('email_verification') ?? null
  if (id === null) {
    return null
  }
  const request = await getUserEmailVerificationRequest(event.locals.user.id, id)
  if (request === null) {
    deleteEmailVerificationRequestCookie(event)
  }
  return request
}

const sendVerificationEmailBucket = new ExpiringTokenBucket(3, 60 * 10)

export {
  getUserEmailVerificationRequest,
  createEmailVerificationRequest,
  deleteUserEmailVerificationRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
  deleteEmailVerificationRequestCookie,
  getUserEmailVerificationRequestFromRequest,
  sendVerificationEmailBucket
}

export interface EmailVerificationRequest {
  id: string
  userId: string
  code: string
  email: string
  expiresAt: Date
}
