import React, { createContext, useContext } from 'react'

// mimic your AuthCtx shape just enough for demo
const DemoAuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  booting: false,
})

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthContext.Provider value={{ user: null, login: async () => {}, logout: async () => {}, booting: false }}>
      {children}
    </DemoAuthContext.Provider>
  )
}

// hook with same name as your real one
export const useAuth = () => useContext(DemoAuthContext)
