// import { useMemo, useState } from 'react';
// import { Link, NavLink, useNavigate } from 'react-router-dom';
// import Button from '../ui/Button';
// import { useAuth } from '../../context/AuthProvider';
// import { useMembership } from '../../hooks/useMembership';
// import { NAV_PUBLIC, NAV_AUTH } from '../../config/nav';

// function initials(name?: string) {
//   if (!name) return 'U';
//   const p = name.trim().split(' ');
//   return (p[0]?.[0] || '').toUpperCase() + (p[1]?.[0] || '').toUpperCase();
// }

// const Icon = {
//   search: (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
//       <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
//     </svg>
//   ),
//   close: (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//     </svg>
//   ),
//   menu: (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//     </svg>
//   ),
// };

// const ActivePill = () => (
//   <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
//     Active
//   </span>
// );

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const { isActive, isLoading: memLoading } = useMembership();
//   const isAuthed = !!user;

//   const navigate = useNavigate();
//   const [q, setQ] = useState('');
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);

//   const avatarHue = useMemo(() => (user ? ((user.name || 'U').length * 23) % 360 : 200), [user]);
//   const canTeach = user?.role === 'instructor' || user?.role === 'admin';

//   const submitSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     const term = q.trim();
//     navigate(term ? `/courses?q=${encodeURIComponent(term)}` : '/courses');
//     setSearchOpen(false);
//     setDrawerOpen(false);
//   };

//   const navClass = ({ isActive: isHere }: { isActive: boolean }) =>
//     isHere
//       ? 'px-3 py-2 rounded-md text-sm font-medium text-primary'
//       : 'px-3 py-2 rounded-md text-sm font-medium hover:text-primary';

//   const membershipLabel = !isAuthed
//     ? 'Membership'
//     : memLoading
//     ? 'Membership'
//     : isActive
//     ? (
//       <span className="inline-flex items-center">
//         Membership <ActivePill />
//       </span>
//     )
//     : 'Get Lifetime';

//   return (
//     <>
//       {/* ONE SOLID BAR */}
//       <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-[0_1px_0_rgba(0,0,0,0.04)]">
//         <div className="container-app h-16 flex items-center gap-3">
//           {/* Left: brand */}
//           <Link to="/" className="flex items-center gap-2 min-w-0">
//             <img src="/images/logo.webp" alt="Educate The World" className="h-8 w-auto" />
//             <span className="hidden sm:block font-semibold whitespace-nowrap truncate max-w-[11rem] md:max-w-none">
//               Educate The World
//             </span>
//             <span className="sm:hidden font-semibold whitespace-nowrap">ETW</span>
//           </Link>

//           {/* Center: search (desktop) */}
//           <form
//             onSubmit={submitSearch}
//             className="hidden md:flex flex-1 items-center gap-2 mx-4 max-w-[640px] rounded-full border bg-white px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20"
//           >
//             {Icon.search}
//             <input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="Search for courses, exams, topics…"
//               className="w-full bg-transparent outline-none text-sm"
//             />
//             <Button className="rounded-full" variant="secondary" size="sm" type="submit">
//               Search
//             </Button>
//           </form>

//           {/* Right: desktop nav (public + auth-aware) */}
//           <div className="ml-auto hidden md:flex items-center gap-1">
//             {/* NEW: Tutors (public) */}
//             <NavLink to="/tutors" className={navClass}>
//               Tutors
//             </NavLink>

//             {isAuthed ? (
//               <>
//                 <NavLink to="/billing/plans" className={navClass}>
//                   {membershipLabel}
//                 </NavLink>

//                 {NAV_AUTH.map((item) => (
//                   <NavLink key={item.to} to={item.to} className={navClass}>
//                     {item.label}
//                   </NavLink>
//                 ))}

//                 {/* Profile dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={() => setProfileOpen((v) => !v)}
//                     aria-expanded={profileOpen}
//                     aria-label="Profile menu"
//                     className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-white"
//                     style={{ backgroundColor: `hsl(${avatarHue} 70% 45%)` }}
//                   >
//                     <span className="text-xs font-bold">{initials(user?.name)}</span>
//                   </button>
//                   {profileOpen && (
//                     <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white p-2 shadow-lg">
//                       <div className="px-2 pb-2 text-sm font-medium truncate">{user?.name}</div>

//                       <NavLink
//                         to="/billing/plans"
//                         className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                         onClick={() => setProfileOpen(false)}
//                       >
//                         {membershipLabel}
//                       </NavLink>

//                       {/* NEW: quick links for tutoring */}
//                       <NavLink
//                         to="/me/sessions"
//                         className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                         onClick={() => setProfileOpen(false)}
//                       >
//                         My Sessions
//                       </NavLink>
//                       {(user?.role === 'instructor' || user?.role === 'admin') && (
//                         <NavLink
//                           to="/me/tutor/sessions"
//                           className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                           onClick={() => setProfileOpen(false)}
//                         >
//                           Tutor – Sessions
//                         </NavLink>
//                       )}

//                       <NavLink
//                         to="/me"
//                         className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                         onClick={() => setProfileOpen(false)}
//                       >
//                         Profile
//                       </NavLink>

//                       {(user?.role === 'instructor' || user?.role === 'admin') && (
//                         <>
//                           <NavLink
//                             to="/instructor/courses"
//                             className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                             onClick={() => setProfileOpen(false)}
//                           >
//                             Instructor – Courses
//                           </NavLink>
//                           <NavLink
//                             to="/instructor/quizzes"
//                             className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                             onClick={() => setProfileOpen(false)}
//                           >
//                             Instructor – Quizzes
//                           </NavLink>
//                           <NavLink
//                             to="/instructor/live"
//                             className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                             onClick={() => setProfileOpen(false)}
//                           >
//                             Instructor – Live Sessions
//                           </NavLink>
//                           <NavLink
//                             to="/instructor/resources"
//                             className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                             onClick={() => setProfileOpen(false)}
//                           >
//                             Instructor – Resources
//                           </NavLink>
//                           <NavLink
//       to="/me/tutor/profile"
//       className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//       onClick={() => setProfileOpen(false)}
//     >
//       Tutor – Profile
//     </NavLink>
//     <NavLink
//       to="/me/tutor/availability"
//       className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//       onClick={() => setProfileOpen(false)}
//     >
//       Tutor – Availability
//     </NavLink>
//                         </>
//                       )}

//                       {user?.role === 'admin' && (
//                         <NavLink
//                           to="/admin"
//                           className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
//                           onClick={() => setProfileOpen(false)}
//                         >
//                           Admin
//                         </NavLink>
//                       )}

//                       <button
//                         onClick={() => {
//                           logout();
//                           setProfileOpen(false);
//                         }}
//                         className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               // Signed-out: public nav
//               <>
//                 <NavLink to="/billing/plans" className={navClass}>
//                   {membershipLabel}
//                 </NavLink>
//                 {NAV_PUBLIC.map((item) => (
//                   <NavLink key={item.to} to={item.to} className={navClass}>
//                     {item.label}
//                   </NavLink>
//                 ))}
//                 <div className="flex items-center gap-2 pl-1">
//                   <Link to="/login">
//                     <Button variant="ghost">Log in</Button>
//                   </Link>
//                   <Link to="/register">
//                     <Button>Sign up</Button>
//                   </Link>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Mobile: search + menu buttons */}
//           <div className="md:hidden ml-auto flex items-center gap-1">
//             <button className="p-2 rounded hover:bg-primary/10" aria-label="Search" onClick={() => setSearchOpen(true)}>
//               {Icon.search}
//             </button>
//             <button className="p-2 rounded hover:bg-primary/10" aria-label="Menu" onClick={() => setDrawerOpen(true)}>
//               {Icon.menu}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ===== Overlays ===== */}

//       {/* Mobile search overlay */}
//       {searchOpen && (
//         <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setSearchOpen(false)}>
//           <div className="absolute left-0 right-0 top-0 bg-white border-b" onClick={(e) => e.stopPropagation()}>
//             <div className="container-app py-3">
//               <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
//                 <button type="button" className="p-2 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setSearchOpen(false)}>
//                   {Icon.close}
//                 </button>
//                 {Icon.search}
//                 <input
//                   autoFocus
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                   placeholder="Search courses…"
//                   className="w-full bg-transparent outline-none text-sm"
//                 />
//                 <Button className="rounded-full" variant="secondary" size="sm" type="submit">
//                   Search
//                 </Button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile drawer (auth-aware) */}
//       {drawerOpen && (
//         <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setDrawerOpen(false)}>
//           <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
//             <div className="flex items-center justify-between">
//               <div className="font-semibold">Menu</div>
//               <button className="p-2 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setDrawerOpen(false)}>
//                 {Icon.close}
//               </button>
//             </div>

//             <div className="mt-4 grid gap-2">
//               {/* NEW: Tutors visible to everyone on mobile */}
//               <NavLink
//                 to="/tutors"
//                 className="rounded-lg border px-3 py-2 text-sm"
//                 onClick={() => setDrawerOpen(false)}
//               >
//                 Tutors
//               </NavLink>

//               {isAuthed ? (
//                 <>
//                   <NavLink
//                     to="/billing/plans"
//                     className="rounded-lg border px-3 py-2 text-sm"
//                     onClick={() => setDrawerOpen(false)}
//                   >
//                     {membershipLabel}
//                   </NavLink>

//                   {NAV_AUTH.map((item) => (
//                     <NavLink
//                       key={item.to}
//                       to={item.to}
//                       className="rounded-lg border px-3 py-2 text-sm"
//                       onClick={() => setDrawerOpen(false)}
//                     >
//                       {item.label}
//                     </NavLink>
//                   ))}

//                   {/* Quick access tutoring */}
//                   <NavLink
//                     to="/me/sessions"
//                     className="rounded-lg border px-3 py-2 text-sm"
//                     onClick={() => setDrawerOpen(false)}
//                   >
//                     My Sessions
//                   </NavLink>
//                   {(user?.role === 'instructor' || user?.role === 'admin') && (
//                     <>
//                     <NavLink
//                       to="/me/tutor/sessions"
//                       className="rounded-lg border px-3 py-2 text-sm"
//                       onClick={() => setDrawerOpen(false)}
//                     >
//                       Tutor – Sessions
//                     </NavLink>
                    
//                     <NavLink to="/me/tutor/profile"
//                     className="rounded-lg border px-3 py-2 text-sm"
//                     onClick={() => setDrawerOpen(false)}>
//                     Tutor – Profile
//                     </NavLink>

//                     <NavLink
//                       to="/me/tutor/availability"
//                       className="rounded-lg border px-3 py-2 text-sm"
//                       onClick={() => setDrawerOpen(false)}
//                     >
//                       Tutor – Availability
//                     </NavLink>
//                   </>

//                   )}

//                   {(user?.role === 'admin') && (
//                     <NavLink
//                       to="/admin"
//                       className="rounded-lg border px-3 py-2 text-sm"
//                       onClick={() => setDrawerOpen(false)}
//                     >
//                       Admin
//                     </NavLink>
//                   )}

//                   <button
//                     onClick={() => {
//                       logout();
//                       setDrawerOpen(false);
//                     }}
//                     className="rounded-lg border px-3 py-2 text-left text-sm"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <NavLink
//                     to="/billing/plans"
//                     className="rounded-lg border px-3 py-2 text-sm"
//                     onClick={() => setDrawerOpen(false)}
//                   >
//                     {membershipLabel}
//                   </NavLink>

//                   {NAV_PUBLIC.map((item) => (
//                     <NavLink
//                       key={item.to}
//                       to={item.to}
//                       className="rounded-lg border px-3 py-2 text-sm"
//                       onClick={() => setDrawerOpen(false)}
//                     >
//                       {item.label}
//                     </NavLink>
//                   ))}
//                   <div className="grid grid-cols-2 gap-2 pt-1">
//                     <Link to="/login" onClick={() => setDrawerOpen(false)}>
//                       <Button variant="ghost" full>
//                         Log in
//                       </Button>
//                     </Link>
//                     <Link to="/register" onClick={() => setDrawerOpen(false)}>
//                       <Button full>Sign up</Button>
//                     </Link>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


import { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthProvider';
import { useMembership } from '../../hooks/useMembership';
import { NAV_PUBLIC, NAV_AUTH } from '../../config/nav';
import {
  Search, X, Menu,
  Users, BadgeCheck, CreditCard, BookOpen, MessageSquare, Video, FolderOpen, Crown,
  User as UserIcon, LogOut as LogOutIcon, Settings, GraduationCap, CalendarClock, Library
} from 'lucide-react';

function initials(name?: string) {
  if (!name) return 'U';
  const p = name.trim().split(' ');
  return (p[0]?.[0] || '').toUpperCase() + (p[1]?.[0] || '').toUpperCase();
}

const ActivePill = () => (
  <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
    Active
  </span>
);

// Small helper to render an icon next to a label
const withIcon = (IconCmp: any, label: string) => (
  <span className="inline-flex items-center gap-1.5">
    <IconCmp className="h-4 w-4" aria-hidden />
    <span>{label}</span>
  </span>
);

// Optional map for your NAV_* items if you want per-route icons
const labelIconFor = (label: string) => {
  const L = label.toLowerCase();
  if (L.includes('course')) return BookOpen;
  if (L.includes('mock')) return GraduationCap;
  if (L.includes('discussion')) return MessageSquare;
  if (L.includes('live')) return Video;
  if (L.includes('resource')) return FolderOpen;
  if (L.includes('membership') || L.includes('lifetime')) return Crown;
  return Library;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isActive, isLoading: memLoading } = useMembership();
  const isAuthed = !!user;

  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const avatarHue = useMemo(() => (user ? ((user.name || 'U').length * 23) % 360 : 200), [user]);
  const canTeach = user?.role === 'instructor' || user?.role === 'admin';

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/courses?q=${encodeURIComponent(term)}` : '/courses');
    setSearchOpen(false);
    setDrawerOpen(false);
  };


  const navClass = ({ isActive: isHere }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors
     ${isHere ? 'text-primary underline underline-offset-[10px] decoration-2' : 'text-gray-700 hover:text-primary'}`;

  const membershipLabel = !isAuthed
    ? 'Membership'
    : memLoading
    ? 'Membership'
    : isActive
    ? (
      <span className="inline-flex items-center gap-1.5">
        <BadgeCheck className="h-4 w-4" />
        <span>Membership</span>
        <ActivePill />
      </span>
    )
    : withIcon(Crown, 'Get Lifetime');

  return (
    <>
      {/* ONE SOLID BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="container-app h-16 flex items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: brand */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src="/images/logo.webp" alt="Educate The World" className="h-8 w-auto" />
            <span className="hidden sm:block font-semibold whitespace-nowrap truncate max-w-[11rem] md:max-w-none">
              Educate The World
            </span>
            <span className="sm:hidden font-semibold whitespace-nowrap">ETW</span>
          </Link>

          {/* Center: search (desktop) */}
          {/* <form
            onSubmit={submitSearch}
            className="hidden md:flex flex-1 items-center gap-2 mx-4 max-w-[640px] rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20"
          >
            <Search className="h-4 w-4 text-gray-500" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for courses, exams, topics…"
              className="w-full bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
            <Button className="rounded-full" variant="secondary" size="sm" type="submit">
              Search
            </Button>
          </form> */}

          {/* Right: desktop nav (public + auth-aware) */}
          <div className="ml-auto hidden md:flex items-center gap-1">
            {/* Tutors (public) */}
            <NavLink to="/tutors" className={navClass}>
              {withIcon(Users, 'Tutors')}
            </NavLink>

            {isAuthed ? (
              <>
                <NavLink to="/billing/plans" className={navClass}>
                  {membershipLabel}
                </NavLink>

                {NAV_AUTH.map((item) => {
                  const Ico = labelIconFor(item.label);
                  return (
                    <NavLink key={item.to} to={item.to} className={navClass}>
                      {withIcon(Ico, item.label)}
                    </NavLink>
                  );
                })}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-expanded={profileOpen}
                    aria-label="Profile menu"
                    className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white ring-1 ring-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                    style={{ backgroundColor: `hsl(${avatarHue} 70% 45%)` }}
                  >
                    <span className="text-xs font-bold">{initials(user?.name)}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                      <div className="px-2 pb-2 text-sm font-medium truncate flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span>{user?.name}</span>
                      </div>

                      <NavLink
                        to="/billing/plans"
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <BadgeCheck className="h-4 w-4" />
                        <span className="truncate">Membership</span>
                        {!memLoading && isActive && <ActivePill />}
                      </NavLink>

                      {/* quick links */}
                      <NavLink
                        to="/me/sessions"
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <CalendarClock className="h-4 w-4" />
                        <span>My Sessions</span>
                      </NavLink>

                      {canTeach && (
                        <>
                          <NavLink
                            to="/me/tutor/sessions"
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            <span>Tutor – Sessions</span>
                          </NavLink>
                          <NavLink
                            to="/me/tutor/profile"
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Tutor – Profile</span>
                          </NavLink>
                          <NavLink
                            to="/me/tutor/availability"
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <CalendarClock className="h-4 w-4" />
                            <span>Tutor – Availability</span>
                          </NavLink>

                          {/* <NavLink
                            to="/instructor/courses"
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>Instructor – Courses</span>
                          </NavLink> */}
                          <NavLink
                            to="/instructor/quizzes"
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <GraduationCap className="h-4 w-4" />
                            <span>Instructor – Quizzes</span>
                          </NavLink>
                          <NavLink
                            to="/instructor/live"
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Video className="h-4 w-4" />
                            <span>Instructor – Live Sessions</span>
                          </NavLink>
                          <NavLink
                            to="/instructor/resources"
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <FolderOpen className="h-4 w-4" />
                            <span>Instructor – Resources</span>
                          </NavLink>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <NavLink
                          to="/admin"
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin</span>
                        </NavLink>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="mt-1 w-full rounded-md px-2 py-2 text-left text-sm hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Signed-out: public nav
              <>
                <NavLink to="/billing/plans" className={navClass}>
                  {membershipLabel}
                </NavLink>
                {NAV_PUBLIC.map((item) => {
                  const Ico = labelIconFor(item.label);
                  return (
                    <NavLink key={item.to} to={item.to} className={navClass}>
                      {withIcon(Ico, item.label)}
                    </NavLink>
                  );
                })}
                <div className="flex items-center gap-2 pl-1">
                  <Link to="/login">
                    <Button variant="ghost" className="inline-flex items-center gap-1.5">
                      <UserIcon className="h-4 w-4" />
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="inline-flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" />
                      Sign up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile: search + menu buttons */}
          <div className="md:hidden ml-auto flex items-center gap-1">
            <button
              className="p-2 rounded hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              aria-label="Menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Overlays ===== */}

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setSearchOpen(false)}>
          <div className="absolute left-0 right-0 top-0 bg-white border-b rounded-b-2xl shadow-md" onClick={(e) => e.stopPropagation()}>
            <div className="container-app py-3 px-4">
              <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100"
                  aria-label="Close"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search courses…"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
                <Button className="rounded-full" variant="secondary" size="sm" type="submit">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer (auth-aware) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setDrawerOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl p-4 pb-[max(16px,env(safe-area-inset-bottom))] rounded-l-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">Menu</div>
              <button className="p-2 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <NavLink
                to="/tutors"
                className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                onClick={() => setDrawerOpen(false)}
              >
                <Users className="h-4 w-4" />
                Tutors
              </NavLink>

              {isAuthed ? (
                <>
                  <NavLink
                    to="/billing/plans"
                    className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Membership {(!memLoading && isActive) && <ActivePill />}
                  </NavLink>

                  {NAV_AUTH.map((item) => {
                    const Ico = labelIconFor(item.label);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <Ico className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    );
                  })}

                  <NavLink
                    to="/me/sessions"
                    className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <CalendarClock className="h-4 w-4" />
                    My Sessions
                  </NavLink>

                  {canTeach && (
                    <>
                      <NavLink
                        to="/me/tutor/sessions"
                        className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        Tutor – Sessions
                      </NavLink>
                      <NavLink
                        to="/me/tutor/profile"
                        className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Tutor – Profile
                      </NavLink>
                      <NavLink
                        to="/me/tutor/availability"
                        className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <CalendarClock className="h-4 w-4" />
                        Tutor – Availability
                      </NavLink>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                    </NavLink>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="rounded-lg border px-3 py-3 text-left text-sm inline-flex items-center gap-2"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/billing/plans"
                    className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Crown className="h-4 w-4" />
                    Membership
                  </NavLink>

                  {NAV_PUBLIC.map((item) => {
                    const Ico = labelIconFor(item.label);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className="rounded-lg border px-3 py-3 text-sm inline-flex items-center gap-2"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <Ico className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link to="/login" onClick={() => setDrawerOpen(false)}>
                      <Button variant="ghost" full className="inline-flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4" />
                        Log in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setDrawerOpen(false)}>
                      <Button full className="inline-flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4" />
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
