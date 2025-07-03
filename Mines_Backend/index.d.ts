export {}

declare global {
  namespace Express {
    interface User {
      user?: string
    }
  }
}
