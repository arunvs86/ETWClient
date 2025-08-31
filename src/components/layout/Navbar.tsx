import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthProvider";
import { useMembership } from "../../hooks/useMembership";
import { NAV_PUBLIC, NAV_AUTH } from "../../config/nav";

function initials(name?: string) {
  if (!name) return "U";
  const p = name.trim().split(" ");
  return (p[0]?.[0] || "").toUpperCase() + (p[1]?.[0] || "").toUpperCase();
}

const Icon = {
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const ActivePill = () => (
  <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
    Active
  </span>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isActive, isLoading: memLoading } = useMembership();
  const isAuthed = !!user;

  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const avatarHue = useMemo(() => (user ? ((user.name || "U").length * 23) % 360 : 200), [user]);
  const canTeach = user?.role === "instructor" || user?.role === "admin";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/courses?q=${encodeURIComponent(term)}` : "/courses");
    setSearchOpen(false);
    setDrawerOpen(false);
  };

  const navClass = ({ isActive: isHere }: { isActive: boolean }) =>
    isHere
      ? "px-3 py-2 rounded-md text-sm font-medium text-primary"
      : "px-3 py-2 rounded-md text-sm font-medium hover:text-primary";

  const membershipLabel = !isAuthed
    ? "Membership"
    : memLoading
    ? "Membership"
    : isActive
    ? (
      <span className="inline-flex items-center">
        Membership <ActivePill />
      </span>
    )
    : "Get Lifetime";

  return (
    <>
      {/* ONE SOLID BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="container-app h-16 flex items-center gap-3">
          {/* Left: brand */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src="/images/logo.webp" alt="Educate The World" className="h-8 w-auto" />
            <span className="hidden sm:block font-semibold whitespace-nowrap truncate max-w-[11rem] md:max-w-none">
              Educate The World
            </span>
            <span className="sm:hidden font-semibold whitespace-nowrap">ETW</span>
          </Link>

          {/* Center: search (desktop) */}
          <form
            onSubmit={submitSearch}
            className="hidden md:flex flex-1 items-center gap-2 mx-4 max-w-[640px] rounded-full border bg-white px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20"
          >
            {Icon.search}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for courses, exams, topics…"
              className="w-full bg-transparent outline-none text-sm"
            />
            <Button className="rounded-full" variant="secondary" size="sm" type="submit">
              Search
            </Button>
          </form>

          {/* Right: desktop nav (auth-aware) */}
          <div className="ml-auto hidden md:flex items-center gap-1">
            {/* NEW: Quizzes is visible to everyone */}
            {/* <NavLink to="/quizzes" className={navClass}>
              Quizzes
            </NavLink> */}

            {isAuthed ? (
              <>
                {/* Membership always visible for signed-in */}
                <NavLink to="/billing/plans" className={navClass}>
                  {membershipLabel}
                </NavLink>

                {/* Signed-in tabs from config */}
                {NAV_AUTH.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClass}>
                    {item.label}
                  </NavLink>
                ))}

                {/* Avatar */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-expanded={profileOpen}
                    aria-label="Profile menu"
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: `hsl(${avatarHue} 70% 45%)` }}
                  >
                    <span className="text-xs font-bold">{initials(user?.name)}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white p-2 shadow-lg">
                      <div className="px-2 pb-2 text-sm font-medium truncate">{user?.name}</div>

                      <NavLink
                        to="/billing/plans"
                        className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        {membershipLabel}
                      </NavLink>

                      <NavLink
                        to="/me"
                        className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Profile
                      </NavLink>

                      {canTeach && (
                        <>
                          <NavLink
                            to="/instructor/courses"
                            className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            Instructor – Courses
                          </NavLink>
                          {/* NEW: instructor quizzes */}
                          <NavLink
                            to="/instructor/quizzes"
                            className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            Instructor – Quizzes
                          </NavLink>

                          <NavLink
                            to="/instructor/live"
                            className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            Instructor – Live Sessions
                          </NavLink>
                          <NavLink
                            to="/instructor/resources"
                            className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            Instructor – Resources
                          </NavLink>
                        </>
                      )}
                      {user?.role === "admin" && (
                        <NavLink
                          to="/admin"
                          className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          Admin
                        </NavLink>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Signed-out: Membership + Login/Signup
              <>
                {NAV_PUBLIC.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClass}>
                    {item.label}
                  </NavLink>
                ))}
                <div className="flex items-center gap-2 pl-1">
                  <Link to="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Sign up</Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile: search + menu buttons */}
          <div className="md:hidden ml-auto flex items-center gap-1">
            <button className="p-2 rounded hover:bg-primary/10" aria-label="Search" onClick={() => setSearchOpen(true)}>
              {Icon.search}
            </button>
            <button className="p-2 rounded hover:bg-primary/10" aria-label="Menu" onClick={() => setDrawerOpen(true)}>
              {Icon.menu}
            </button>
          </div>
        </div>
      </header>

      {/* ===== Overlays ===== */}

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setSearchOpen(false)}>
          <div className="absolute left-0 right-0 top-0 bg-white border-b" onClick={(e) => e.stopPropagation()}>
            <div className="container-app py-3">
              <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
                <button type="button" className="p-2 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setSearchOpen(false)}>
                  {Icon.close}
                </button>
                {Icon.search}
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search courses…"
                  className="w-full bg-transparent outline-none text-sm"
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
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">Menu</div>
              <button className="p-2 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                {Icon.close}
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {/* NEW: public Quizzes link on mobile for everyone */}
              {/* <NavLink
                to="/quizzes"
                className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => setDrawerOpen(false)}
              >
                Quizzes
              </NavLink> */}

              {isAuthed ? (
                <>
                  <NavLink
                    to="/billing/plans"
                    className="rounded-lg border px-3 py-2 text-sm"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {membershipLabel}
                  </NavLink>

                  {NAV_AUTH.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="rounded-lg border px-3 py-2 text-sm"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  <NavLink to="/me" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setDrawerOpen(false)}>
                    Profile
                  </NavLink>

                  {canTeach && (
                    <>
                      <NavLink to="/instructor/courses" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setDrawerOpen(false)}>
                        Instructor – Courses
                      </NavLink>
                      {/* NEW */}
                      <NavLink to="/instructor/quizzes" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setDrawerOpen(false)}>
                        Instructor – Quizzes
                      </NavLink>
                    </>
                  )}

                  {user?.role === "admin" && (
                    <NavLink to="/admin" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setDrawerOpen(false)}>
                      Admin
                    </NavLink>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="rounded-lg border px-3 py-2 text-left text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {NAV_PUBLIC.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="rounded-lg border px-3 py-2 text-sm"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link to="/login" onClick={() => setDrawerOpen(false)}>
                      <Button variant="ghost" full>
                        Log in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setDrawerOpen(false)}>
                      <Button full>Sign up</Button>
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
