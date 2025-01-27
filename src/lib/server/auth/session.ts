import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'
import prisma from '$lib/server/prisma'

import type { User } from '$lib/types/user'
import type { RequestEvent } from '@sveltejs/kit'

const validateSessionToken = async (token: string): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  })

  if (!session) {
    console.log('Session not found')
    return { session: null, user: null }
  }

  const user: User = {
    id: session.user.id,
    email: session.user.email,
    username: session.user.username,
    emailVerified: session.user.emailVerified,
    registered2FA: session.user.totpKey !== null
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: session.id } })
    return { session: null, user: null }
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: session.expiresAt }
    })
  }

  return { session, user }
}

const invalidateSession = async (sessionId: string): Promise<void> => {
  await prisma.session.delete({ where: { id: sessionId } })
}

const invalidateUserSessions = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({ where: { userId } })
}

const setSessionTokenCookie = (event: RequestEvent, token: string, expiresAt: Date): void => {
  event.cookies.set('session', token, {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    expires: expiresAt
  })
}

const deleteSessionTokenCookie = (event: RequestEvent): void => {
  event.cookies.set('session', '', {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 0
  })
}

const generateSessionToken = (): string => {
  const tokenBytes = new Uint8Array(20)
  crypto.getRandomValues(tokenBytes)
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase()
  return token
}

const createSession = async (
  token: string,
  userId: string,
  flags: SessionFlags
): Promise<Session> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    twoFactorVerified: flags.twoFactorVerified
  }
  await prisma.session.create({
    data: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      twoFactorVerified: session.twoFactorVerified
    }
  })
  return session
}

const setSessionAs2FAVerified = async (sessionId: string): Promise<void> => {
  await prisma.session.update({
    where: { id: sessionId },
    data: { twoFactorVerified: true }
  })
}

export {
  validateSessionToken,
  invalidateSession,
  invalidateUserSessions,
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  generateSessionToken,
  createSession,
  setSessionAs2FAVerified
}

export interface SessionFlags {
  twoFactorVerified: boolean
}

export interface Session extends SessionFlags {
  id: string
  expiresAt: Date
  userId: string
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null }
