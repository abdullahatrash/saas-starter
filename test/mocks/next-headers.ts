// Stand-in for `next/headers` so route handlers can be exercised outside a
// Next request scope. The real cookies() reads from Next's async request
// context, which does not exist when we invoke a handler with a bare Request.
// Only the cookie transport is faked here — the JWT it carries is signed and
// verified for real by lib/auth/session.ts.

const store = new Map<string, string>()

export function __setCookie(name: string, value: string) {
  store.set(name, value)
}

export function __clearCookies() {
  store.clear()
}

export async function cookies() {
  return {
    get(name: string) {
      return store.has(name) ? { name, value: store.get(name)! } : undefined
    },
    getAll() {
      return [...store.entries()].map(([name, value]) => ({ name, value }))
    },
    has(name: string) {
      return store.has(name)
    },
    set(name: string, value: string) {
      store.set(name, value)
    },
    delete(name: string) {
      store.delete(name)
    },
  }
}

export async function headers() {
  return new Headers()
}
