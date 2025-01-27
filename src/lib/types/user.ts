import { Prisma } from '@prisma/client'

export type User = Prisma.UserGetPayload<{
  select: {
    id: true
    email: true
    username: true
    emailVerified: true
  }
}> & {
  registered2FA: boolean
}
