// // src/context/AuthProvider.tsx
// import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import api, {
//   handleLoginSuccessToken,
//   handleLogoutClientOnly,
//   refreshAccessToken,
// } from '../lib/api';

// type User = {
//   _id: string;
//   email: string;
//   name?: string;
//   role?: 'admin' | 'instructor' | 'student';
//   [k: string]: any;
// };

// type LoginInput = { email: string; password: string };

// type AuthCtx = {
//   user: User | null;
//   loading: boolean;
//   isAdmin: boolean;
//   isInstructor: boolean;
//   login: (input: LoginInput) => Promise<void>;
//   googleSignIn: (idToken: string) => Promise<void>;
//   logout: () => Promise<void>;
//   refreshMe: () => Promise<void>;
// };

// const Ctx = createContext<AuthCtx | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   async function fetchMe() {
//     const res = await api.get('/auth/me');
//     const me = (res.data?.user ?? res.data) as User;
//     setUser(me || null);
//   }

//   // bootstrap: try refresh on mount, then fetch /auth/me
//   useEffect(() => {
//     (async () => {
//       try {
//         await refreshAccessToken(); // sets token if refresh cookie is valid
//         await fetchMe();
//       } catch {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // email/password login
//   async function login(input: LoginInput) {
//     const res = await api.post('/auth/login', input);
//     const token =
//       res.data?.accessToken || res.data?.token || res.data?.access_token;
//     if (!token) throw new Error('No access token from login');
//     await handleLoginSuccessToken(token);
//     await fetchMe();
//   }

//   // Google sign-in (backend should validate idToken and return access token)
//   async function googleSignIn(idToken: string) {
//     const res = await api.post('/auth/google', { idToken });
//     const token =
//       res.data?.accessToken || res.data?.token || res.data?.access_token;
//     if (!token) throw new Error('No access token from Google sign-in');
//     await handleLoginSuccessToken(token);
//     await fetchMe();
//   }

//   async function logout() {
//     try {
//       await api.post('/auth/logout'); // clears refresh cookie server-side
//     } catch {}
//     handleLogoutClientOnly();
//     setUser(null);
//   }

//   async function refreshMe() {
//     await fetchMe();
//   }

//   const value = useMemo<AuthCtx>(() => ({
//     user,
//     loading,
//     isAdmin: user?.role === 'admin',
//     isInstructor: user?.role === 'instructor',
//     login,
//     googleSignIn,
//     logout,
//     refreshMe,
//   }), [user, loading]);

//   return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(Ctx);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// }


// src/context/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, {
  handleLoginSuccessToken,
  handleLogoutClientOnly,
  refreshAccessToken,
} from '../lib/api';

type User = {
  _id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'instructor' | 'student';
  [k: string]: any;
};

type LoginInput = { email: string; password: string };
type RegisterInput = { name: string; email: string; password: string };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>; // ⬅️ added
  googleSignIn: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    const res = await api.get('/auth/me');
    const me = (res.data?.user ?? res.data) as User;
    setUser(me || null);
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshAccessToken();
        await fetchMe();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(input: LoginInput) {
    const res = await api.post('/auth/login', input);
    const token = res.data?.accessToken || res.data?.token || res.data?.access_token;
    if (!token) throw new Error('No access token from login');
    await handleLoginSuccessToken(token);
    await fetchMe();
  }

  // ⬇️ NEW: email/password register
  async function register(input: RegisterInput) {
    const res = await api.post('/auth/register', input);
    const token = res.data?.accessToken || res.data?.token || res.data?.access_token;
    if (!token) throw new Error('No access token from register');
    await handleLoginSuccessToken(token);
    await fetchMe();
  }

  async function googleSignIn(idToken: string) {
    const res = await api.post('/auth/google', { idToken });
    const token = res.data?.accessToken || res.data?.token || res.data?.access_token;
    if (!token) throw new Error('No access token from Google sign-in');
    await handleLoginSuccessToken(token);
    await fetchMe();
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {}
    handleLogoutClientOnly();
    setUser(null);
  }

  async function refreshMe() {
    await fetchMe();
  }

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      isInstructor: user?.role === 'instructor',
      login,
      register, // ⬅️ expose
      googleSignIn,
      logout,
      refreshMe,
    }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
