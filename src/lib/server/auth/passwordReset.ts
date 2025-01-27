import { encodeHexLowerCase } from '@oslojs/encoding'
import { generateRandomOTP } from '$lib/server/utils'
import { sha256 } from '@oslojs/crypto/sha2'
import type { User } from '$lib/types/user'
import prisma from '$lib/server/prisma'

import type { RequestEvent } from '@sveltejs/kit'

const createPasswordResetSession = async (
  token: string,
  userId: string,
  email: string
): Promise<PasswordResetSession> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: PasswordResetSession = {
    id: sessionId,
    userId,
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    code: generateRandomOTP(),
    emailVerified: false,
    twoFactorVerified: false
  }

  await prisma.passwordResetSession.create({
    data: {
      id: session.id,
      userId: session.userId,
      email: session.email,
      code: session.code,
      expiresAt: session.expiresAt
    }
  })
  return session
}

const validatePasswordResetSessionToken = async (
  token: string
): Promise<PasswordResetSessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session = await prisma.passwordResetSession.findUnique({
    where: { id: sessionId },
    include: { user: true }
  })

  if (!session) {
    return { session: null, user: null }
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.passwordResetSession.delete({ where: { id: session.id } })
    return { session: null, user: null }
  }

  const user: User = {
    id: session.user.id,
    email: session.user.email,
    username: session.user.username,
    emailVerified: session.user.emailVerified,
    registered2FA: session.user.totpKey !== null
  }

  return { session, user }
}

const setPasswordResetSessionAsEmailVerified = async (sessionId: string): Promise<void> => {
  await prisma.passwordResetSession.update({
    where: {
      id: sessionId
    },
    data: {
      emailVerified: true
    }
  })
}

const setPasswordResetSessionAs2FAVerified = async (sessionId: string): Promise<void> => {
  await prisma.passwordResetSession.update({
    where: {
      id: sessionId
    },
    data: {
      twoFactorVerified: true
    }
  })
}

const invalidateUserPasswordResetSessions = async (userId: string): Promise<void> => {
  await prisma.passwordResetSession.deleteMany({
    where: {
      userId
    }
  })
}

const validatePasswordResetSessionRequest = async (
  event: RequestEvent
): Promise<PasswordResetSessionValidationResult> => {
  const token = event.cookies.get('password_reset_session') ?? null
  if (token === null) {
    return { session: null, user: null }
  }
  const result = await validatePasswordResetSessionToken(token)
  if (result.session === null) {
    deletePasswordResetSessionTokenCookie(event)
  }
  return result
}

const setPasswordResetSessionTokenCookie = (
  event: RequestEvent,
  token: string,
  expiresAt: Date
): void => {
  event.cookies.set('password_reset_session', token, {
    expires: expiresAt,
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
    secure: !import.meta.env.DEV
  })
}

const deletePasswordResetSessionTokenCookie = (event: RequestEvent): void => {
  event.cookies.set('password_reset_session', '', {
    maxAge: 0,
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
    secure: !import.meta.env.DEV
  })
}

const sendPasswordResetEmail = (email: string, code: string): void => {
  console.log(`To ${email}: Your reset code is ${code}`)
}

export {
  createPasswordResetSession,
  validatePasswordResetSessionToken,
  setPasswordResetSessionAsEmailVerified,
  setPasswordResetSessionAs2FAVerified,
  invalidateUserPasswordResetSessions,
  validatePasswordResetSessionRequest,
  setPasswordResetSessionTokenCookie,
  deletePasswordResetSessionTokenCookie,
  sendPasswordResetEmail
}

export interface PasswordResetSession {
  id: string
  userId: string
  email: string
  expiresAt: Date
  code: string
  emailVerified: boolean
  twoFactorVerified: boolean
}

export type PasswordResetSessionValidationResult =
  | { session: PasswordResetSession; user: User }
  | { session: null; user: null }
