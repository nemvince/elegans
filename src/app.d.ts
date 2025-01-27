import type { Session } from '$lib/server/auth/session'
import type { User } from '$lib/server/auth/user'

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: User | null
      session: Session | null
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
