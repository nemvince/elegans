import { decrypt, decryptToString, encrypt, encryptString } from './encryption'
import { hashPassword } from './password'
import { generateRandomRecoveryCode } from '$lib/server/utils'
import type { User } from '$lib/types/user'
import prisma from '$lib/server/prisma'

const verifyUsernameInput = (username: string): boolean => {
  return username.length > 3 && username.length < 32 && username.trim() === username
}

const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    },
    select: {
      id: true
    }
  })

  return user === null
}

const createUser = async (email: string, username: string, password: string): Promise<User> => {
  const passwordHash = await hashPassword(password)
  const recoveryCode = generateRandomRecoveryCode()
  console.log('recoveryCode', recoveryCode)
  const encryptedRecoveryCode = encryptString(recoveryCode)
  const createdUser = await prisma.user.create({
    data: {
      email,
      username,
      password: passwordHash,
      recoveryCode: encryptedRecoveryCode
    },
    select: {
      id: true
    }
  })

  const user: User = {
    id: createdUser.id,
    email,
    username,
    emailVerified: false,
    registered2FA: false
  }

  return user
}

const updateUserPassword = async (userId: string, password: string): Promise<void> => {
  const passwordHash = await hashPassword(password)
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      password: passwordHash
    }
  })
}

const updateUserEmailAndSetEmailAsVerified = async (
  userId: string,
  email: string
): Promise<void> => {
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      email,
      emailVerified: true
    }
  })
}

const setUserAsEmailVerifiedIfEmailMatches = async (
  userId: string,
  email: string
): Promise<boolean> => {
  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      email: email
    },
    data: {
      emailVerified: true
    }
  })
  return result.count > 0
}

const getUserPasswordHash = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      password: true
    }
  })

  if (!user) {
    throw new Error('Invalid user ID')
  }

  return user.password
}

const getUserRecoveryCode = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      recoveryCode: true
    }
  })

  if (!user || !user.recoveryCode) {
    throw new Error('Invalid user ID or recovery code not found')
  }

  return decryptToString(user.recoveryCode)
}

const getUserTOTPKey = async (userId: string): Promise<Uint8Array | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      totpKey: true
    }
  })

  if (!user) {
    throw new Error('Invalid user ID')
  }

  if (!user.totpKey) {
    return null
  }

  return decrypt(user.totpKey)
}

const updateUserTOTPKey = async (userId: string, key: Uint8Array): Promise<void> => {
  const encrypted = encrypt(key)
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      totpKey: encrypted
    }
  })
}

const resetUserRecoveryCode = async (userId: string): Promise<string> => {
  const recoveryCode = generateRandomRecoveryCode()
  const encrypted = encryptString(recoveryCode)
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      recoveryCode: encrypted
    }
  })
  return recoveryCode
}

const getUserFromEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    },
    select: {
      id: true,
      email: true,
      username: true,
      emailVerified: true,
      totpKey: true
    }
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    registered2FA: user.totpKey !== null
  }
}

export {
  verifyUsernameInput,
  checkUsernameAvailability,
  createUser,
  updateUserPassword,
  updateUserEmailAndSetEmailAsVerified,
  setUserAsEmailVerifiedIfEmailMatches,
  getUserPasswordHash,
  getUserRecoveryCode,
  getUserTOTPKey,
  updateUserTOTPKey,
  resetUserRecoveryCode,
  getUserFromEmail
}
