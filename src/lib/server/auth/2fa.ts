import { decryptToString, encryptString } from '$lib/server/auth/encryption'
import { ExpiringTokenBucket } from '$lib/server/auth/rateLimit'
import { generateRandomRecoveryCode } from '$lib/server/utils'
import prisma from '$lib/server/prisma'

const totpBucket = new ExpiringTokenBucket(5, 60 * 30)
const recoveryCodeBucket = new ExpiringTokenBucket(3, 60 * 60)

const resetUser2FAWithRecoveryCode = async (
  userId: string,
  recoveryCode: string
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      recoveryCode: true
    }
  })

  if (user === null) return false

  if (!user.recoveryCode) return false

  const userRecoveryCode = decryptToString(user.recoveryCode)

  if (recoveryCode !== userRecoveryCode) {
    return false
  }

  const newRecoveryCode = generateRandomRecoveryCode()
  const encryptedNewRecoveryCode = encryptString(newRecoveryCode)

  await prisma.session.updateMany({
    where: {
      userId
    },
    data: {
      twoFactorVerified: false
    }
  })

  const result = await prisma.user.update({
    where: {
      id: userId,
      recoveryCode: user.recoveryCode
    },
    data: {
      recoveryCode: encryptedNewRecoveryCode,
      totpKey: null
    }
  })

  return result !== null
}

export { totpBucket, recoveryCodeBucket, resetUser2FAWithRecoveryCode }
