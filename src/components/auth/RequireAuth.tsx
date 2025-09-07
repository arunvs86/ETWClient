import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider'

// export default function RequireAuth() {
//   const { user, booting } = useAuth()
//   const loc = useLocation()

//   if (booting) {
//     return (
//       <div className="min-h-[40vh] grid place-items-center">
//         <div className="animate-pulse text-gray-600">Checking session…</div>
//       </div>
//     )
//   }
//   if (!user) {
//     const next = encodeURIComponent(loc.pathname + loc.search)
//     return <Navigate to={`/login?next=${next}`} replace />
//   }
//   return <Outlet />
// }

export default function RequireAuth() {
  return <Outlet />   // DEMO: always allow
}
