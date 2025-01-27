import prisma from '$lib/server/prisma'

const verifyEmailInput = (email: string): boolean => {
  return /^.+@.+\..+$/.test(email) && email.length < 256
}

const checkEmailAvailability = async (email: string): Promise<boolean> => {
  const count = await prisma.user.count({
    where: {
      email: email
    }
  })
  return count === 0
}

export { verifyEmailInput, checkEmailAvailability }
