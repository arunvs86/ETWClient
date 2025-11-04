import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthProvider';
import { useMembership } from '../../hooks/useMembership';
import { NAV_PUBLIC, NAV_AUTH } from '../../config/nav';
import {
  Search, X, Menu,
  Users, BadgeCheck, CreditCard, BookOpen, MessageSquare, Video, FolderOpen, Crown,
  User as UserIcon, LogOut as LogOutIcon, Settings, GraduationCap, CalendarClock, Library
} from 'lucide-react';

/* ---------------- utils ---------------- */

const MEMBERSHIP_PATH = '/billing/plans';

function initials(name?: string) {
  if (!name) return 'U';
  const p = name.trim().split(/\s+/);
  return (p[0]?.[0] || '').toUpperCase() + (p[1]?.[0] || '').toUpperCase();
}

const withIcon = (IconCmp: any, label: string) => (
  <span className="inline-flex items-center gap-1.5">
    <IconCmp className="h-4 w-4" aria-hidden />
    <span>{label}</span>
  </span>
);

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

function useOutside(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, onClose]);
}
function useEsc(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
}
function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

/* ---------------- component ---------------- */

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isActive, isLoading: memLoading } = useMembership();
  const isAuthed = !!user;
  const canTeach = user?.role === 'instructor' || user?.role === 'admin';

  // prevent duplicate "Membership" on logged-out:
  const navPublicClean = useMemo(
    () => NAV_PUBLIC.filter(item => item.to !== MEMBERSHIP_PATH),
    []
  );

  const navigate = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const avatarHue = useMemo(() => (user ? ((user.name || 'U').length * 23) % 360 : 200), [user]);

  // header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close overlays on route change
  useEffect(() => {
    setProfileOpen(false);
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // a11y helpers
  useOutside(profileRef, () => setProfileOpen(false));
  useEsc(() => {
    if (profileOpen) setProfileOpen(false);
    if (drawerOpen) setDrawerOpen(false);
    if (searchOpen) setSearchOpen(false);
  });
  useScrollLock(drawerOpen || searchOpen);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/courses?q=${encodeURIComponent(term)}` : '/courses');
    setSearchOpen(false);
    setDrawerOpen(false);
  };

  const navClass = ({ isActive: isHere }: { isActive: boolean }) =>
    [
      "relative px-3 py-2 rounded-md text-[0.94rem] font-medium transition-colors whitespace-nowrap",
      "after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-[7px] after:h-[2px] after:rounded-full after:transition-all after:duration-200",
      isHere
        ? "text-primary after:bg-primary"
        : "text-slate-700 hover:text-primary after:bg-primary/0 hover:after:bg-primary/70"
    ].join(' ');

  const membershipLabel = !isAuthed
    ? 'Membership'
    : memLoading
    ? 'Membership'
    : isActive
    ? (
      <span className="inline-flex items-center gap-1.5">
        <BadgeCheck className="h-4 w-4" />
        <span>Membership</span>
        <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
          Active
        </span>
      </span>
    )
    : withIcon(Crown, 'Get Lifetime');

  return (
    <>
      <header
        className={[
          "sticky top-0 z-[70] border-b transition-shadow",
          // subtle gradient + glass
          scrolled
            ? "bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-[0_6px_22px_rgba(2,6,23,0.08)]"
            : "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50"
        ].join(' ')}
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(70,130,180,0.06) 0%, rgba(255,255,255,0) 40%)"
        }}
      >
        <div className="container-app h-16 flex items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <span className="inline-grid place-items-center h-9 w-9 rounded-xl bg-primary/10 ring-1 ring-primary/15">
              <img src="/images/logo.jpeg" alt="Educate The World" className="h-6 w-auto" />
            </span>
            <span className="hidden lg:block font-semibold truncate max-w-[14rem] xl:max-w-none">
              Educate The World
            </span>
            <span className="lg:hidden font-semibold">ETW</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="ml-auto hidden md:flex items-center gap-1">
            <NavLink to="/tutors" className={navClass}>
              {withIcon(Users, 'Tutors')}
            </NavLink>

            {isAuthed ? (
              <>
                <NavLink to={MEMBERSHIP_PATH} className={navClass}>
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

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    aria-label="Open profile menu"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white ring-1 ring-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                    style={{ backgroundColor: `hsl(${avatarHue} 70% 45%)` }}
                  >
                    <span className="text-xs font-extrabold">{initials(user?.name)}</span>
                  </button>

                  {profileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-[18rem] rounded-2xl border border-slate-100 bg-white/95 backdrop-blur p-2 shadow-xl z-[75]"
                    >
                      <div className="px-2 pb-2 text-sm font-medium truncate flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="max-w-[12rem] truncate">{user?.name}</span>
                      </div>

                      <NavLink
                        to={MEMBERSHIP_PATH}
                        role="menuitem"
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <BadgeCheck className="h-4 w-4" />
                        <span className="truncate">Membership</span>
                        {!memLoading && isActive && (
                          <span className="ml-auto inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                            Active
                          </span>
                        )}
                      </NavLink>

                      <NavLink
                        to="/me/sessions"
                        role="menuitem"
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <CalendarClock className="h-4 w-4" />
                        <span>My Sessions</span>
                      </NavLink>

                      {canTeach && (
                        <>
                          <NavLink to="/me/tutor/sessions" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                            <Users className="h-4 w-4" /><span>Tutor – Sessions</span>
                          </NavLink>
                          <NavLink to="/me/tutor/profile" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                            <Settings className="h-4 w-4" /><span>Tutor – Profile</span>
                          </NavLink>
                          <NavLink to="/me/tutor/availability" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                            <CalendarClock className="h-4 w-4" /><span>Tutor – Availability</span>
                          </NavLink>
                          <NavLink to="/instructor/quizzes" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                            <GraduationCap className="h-4 w-4" /><span>Instructor – Quizzes</span>
                          </NavLink>
                          <NavLink to="/instructor/live" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                            <Video className="h-4 w-4" /><span>Instructor – Live Sessions</span>
                          </NavLink>
                          <NavLink to="/instructor/resources" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                            <FolderOpen className="h-4 w-4" /><span>Instructor – Resources</span>
                          </NavLink>
                          <NavLink to="/instructor/ebooks" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                            <FolderOpen className="h-4 w-4" /><span>Instructor – Ebook</span>
                          </NavLink>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <NavLink to="/admin" role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                          <Settings className="h-4 w-4" /><span>Admin</span>
                        </NavLink>
                      )}

                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="mt-1 w-full rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-50 inline-flex items-center gap-2"
                        role="menuitem"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* show Membership once; NAV_PUBLIC cleaned already */}
                <NavLink to={MEMBERSHIP_PATH} className={navClass}>
                  {withIcon(Crown, 'Membership')}
                </NavLink>

                {navPublicClean.map((item) => {
                  const Ico = labelIconFor(item.label);
                  return (
                    <NavLink key={item.to} to={item.to} className={navClass}>
                      {withIcon(Ico, item.label)}
                    </NavLink>
                  );
                })}

                <div className="flex items-center gap-2 pl-1">
                  <Link to="/login">
                    <Button variant="ghost" className="inline-flex items-center gap-1.5 rounded-full h-9 px-3">
                      <UserIcon className="h-4 w-4" />
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="inline-flex items-center gap-1.5 rounded-full h-9 px-3">
                      <CreditCard className="h-4 w-4" />
                      Sign up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Mobile buttons */}
          <div className="md:hidden ml-auto flex items-center gap-1">
            <button
              className="p-2 rounded-lg hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              aria-label="Menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay (mobile) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[80] bg-black/35" onClick={() => setSearchOpen(false)}>
          <div className="absolute left-0 right-0 top-0 bg-white border-b rounded-b-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="container-app py-3 px-4">
              <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm">
                <button type="button" className="p-2 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setSearchOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  ref={searchInputRef}
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

      {/* Drawer (mobile) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[80] bg-black/35" onClick={() => setDrawerOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-2xl p-4 pb-[max(16px,env(safe-area-inset-bottom))] rounded-l-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">Menu</div>
              <button className="p-2 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid gap-2 overflow-y-auto">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 px-1">Explore</div>
              <NavLink
                to="/tutors"
                className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2"
                onClick={() => setDrawerOpen(false)}
              >
                <Users className="h-4 w-4" />
                Tutors
              </NavLink>

              {isAuthed ? (
                <>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 px-1 pt-2">Account</div>
                  <NavLink to={MEMBERSHIP_PATH} className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                    <BadgeCheck className="h-4 w-4" />
                    Membership {(!memLoading && isActive) && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                        Active
                      </span>
                    )}
                  </NavLink>

                  {NAV_AUTH.map((item) => {
                    const Ico = labelIconFor(item.label);
                    return (
                      <NavLink key={item.to} to={item.to} className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Ico className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    );
                  })}

                  <NavLink to="/me/sessions" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                    <CalendarClock className="h-4 w-4" />
                    My Sessions
                  </NavLink>

                  {canTeach && (
                    <>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500 px-1 pt-2">Teaching</div>
                      <NavLink to="/me/tutor/sessions" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Users className="h-4 w-4" />
                        Tutor – Sessions
                      </NavLink>
                      <NavLink to="/me/tutor/profile" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Settings className="h-4 w-4" />
                        Tutor – Profile
                      </NavLink>
                      <NavLink to="/me/tutor/availability" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <CalendarClock className="h-4 w-4" />
                        Tutor – Availability
                      </NavLink>
                      <NavLink to="/instructor/quizzes" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <GraduationCap className="h-4 w-4" />
                        Instructor – Quizzes
                      </NavLink>
                      <NavLink to="/instructor/live" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Video className="h-4 w-4" />
                        Instructor – Live Sessions
                      </NavLink>
                      <NavLink to="/instructor/resources" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <FolderOpen className="h-4 w-4" />
                        Instructor – Resources
                      </NavLink>
                      <NavLink to="/instructor/ebooks" className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <FolderOpen className="h-4 w-4" />
                        Instructor – Ebook
                      </NavLink>
                    </>
                  )}

                  <button
                    onClick={() => { logout(); setDrawerOpen(false); }}
                    className="rounded-xl border px-3 py-3 text-left text-sm inline-flex items-center gap-2"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Membership appears ONCE for logged-out */}
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 px-1 pt-2">Get Started</div>
                  <NavLink to={MEMBERSHIP_PATH} className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                    <Crown className="h-4 w-4" />
                    Membership
                  </NavLink>

                  {navPublicClean.map((item) => {
                    const Ico = labelIconFor(item.label);
                    return (
                      <NavLink key={item.to} to={item.to} className="rounded-xl border px-3 py-3 text-sm inline-flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Ico className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    );
                  })}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link to="/login" onClick={() => setDrawerOpen(false)}>
                      <Button variant="ghost" full className="inline-flex items-center gap-1.5 rounded-full h-10">
                        <UserIcon className="h-4 w-4" />
                        Log in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setDrawerOpen(false)}>
                      <Button full className="inline-flex items-center gap-1.5 rounded-full h-10">
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
