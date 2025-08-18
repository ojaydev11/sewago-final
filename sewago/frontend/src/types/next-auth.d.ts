// Type augmentation for NextAuth.js v4

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
