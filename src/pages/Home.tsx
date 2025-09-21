import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { useMembership } from "@/hooks/useMembership";
import ContinueLearningRail from "@/components/home/ContinueLearningRail";
import UpcomingLiveSessions from '@/components/home/UpcomingLiveSessions';

/* ===== Content from your brief (unchanged) ===== */
const CORE_FEATURES = [
  { title: "Quality Education", desc: "Meticulously curated courses taught by industry experts for excellence.", icon: "🎓" },
  { title: "Accessibility", desc: "World-class education accessible to all, anytime, anywhere.", icon: "🌍" },
  { title: "Flexibility", desc: "Study on your schedule — day, night, or weekends.", icon: "🕘" },
  { title: "Affordability", desc: "Competitive pricing with discounts and financial assistance.", icon: "💷" },
];
const HIGHLIGHTS = [
  { title: "Top-Notch Education", icon: "🏅" },
  { title: "Affordable Tuition", icon: "💸" },
  { title: "Flexible Options", icon: "🧭" },
  { title: "Career Support", icon: "💼" },
];
const ADVANTAGES = [
  { title: "Comprehensive Curriculum", points: ["Core concepts mastered", "Real exam-style questions", "Clear learning path"], img: "/images/collage.avif" },
  { title: "Interactive Learning", points: ["Videos + notes + quizzes", "Projects & discussions", "Mentor feedback"], img: "/images/hero-udemy.avif" },
  { title: "Flexible Schedule & Lifetime Access", points: ["Self-paced modules", "Mobile-friendly player", "Lifetime resource access"], img: "/images/course-placeholder.avif" },
];
const FAQS = [
  { q: "What courses does Educate the World offer?", a: "We offer a diverse range of courses covering technology, business, arts, healthcare, and more. Our catalog is constantly expanding to meet the evolving needs of learners." },
  { q: "How long do I have access to a course?", a: "Courses are delivered entirely online. Once you enroll, you have lifetime access to all materials, lectures, and resources." },
  { q: "Do you offer financial aid or discounts?", a: "Yes. We strive to make education accessible to everyone with discounts and financial aid programs for eligible students." },
  { q: "Can I interact with instructors or other students?", a: "Yes. Ask questions, participate in discussions, and collaborate on projects to enhance your learning experience." },
];
const REVIEWS = [
  { name: "Anju Raina", role: "user", quote: "Overall a really great educational platform.There's lots of information available to all people that is definitely very helpful when it comes to all aspects of the application.There were loads of very informative sessions about the UCAT exam that were helpful in providing tips and tricks as well as motivating my son for the UCAT.Other medical students such as Abhi and Joshini helped my son a lot with his interview practice as well, with these 2 students just being a couple of examples of the many offering help and advice. All the medical students were very supportive of other medical applicants as well as also being very knowledgeable on the application process as a whole. Would definitely recommend this group", rating: 5 },
  { name: "Vidula Selvan", role: "user", quote: "Abhi is a really great coach and provides thoughtful and insightful feedback for medical interviews , which really helps you to reflect on your mistakes and improve your technique. He takes into account which universities you have applied for as well as your individual strengths and weaknesses and this really helped me to get all 4 of my offers. He keeps lessons engaging.I really recommend for any aspiring medics! Vidula, 1st year at KCL 😊", rating: 5 },
  { name: "Viji", role: "International student", quote: "Hi all, Happy to inform you all that our daughter has got all 4 Uni offers (Cambridge, Imperial, UCL and Kings) and now secured a place at Cambridge. We have been attending informative lectures, interview shadowing, Interview & UCAT coaching and mock interview sessions organised by Dr. Ezhil. He is our go to person for any admissions queries. Huge thanks to Dr. Raji, Priya, Abhi and Megan. Special thanks to to Abhi for being our lifeline support in clarifying our doubts, guiding us in the admissions and interview process. Megan was super helpful with the BMAT especially the essay writing section, and MMI + Cambridge focussed interviews. Both are big assets to the group and we are very grateful for their support. Just to add majority of the advise which we received are free or at afforable prices. Profit is not their goal at all", rating: 5 },
  { name: "Arathy S. Lankupalli", role: "Admissions applicant", quote: "Educate medical helped a lot, with their aid I was able to get a place at UCLan as an international student. Especially Abhi (my mentor) helped me all through out my preparations and provided me with the materials I needed to crack my interview.", rating: 5 },
  { name: "Rehana", role: "Pre-med", quote: "Excellent guidance and support provided. Dr Ezhil helped with work experience and UCAT training along with Preston health mela presentation through posters, which helped to prepare for personal statement and interviews. Appreciate their effort in supporting my daughter with a successful med offer.", rating: 5 },
  { name: "Amar Asokkumar", role: "Pre-med", quote: "Joining the medical interview group on WhatsApp was extremely helpful for my daughter . It gave her a lot of insight into the application process . The study days and the mock interviews were very helpful . As a parent it also helped clarify any queries . Overall very useful and nicely tun by the organisers! 👏👏", rating: 5 },
  { name: "vp sk", role: "Pre-med", quote: "Affordable price. Guidance and support throughout the journey towards medicine. My daughter got her first choice of university. Thanks team", rating: 5 },
  { name: "Vasitha Neel", role: "Pre-med", quote: "Thank you so much for all the help you’ve given me across my medicine application process Abhi ☺️ Abhi has been very supportive and informative and has especially helped me a lot with my interviews, thank you so much!", rating: 5 },
  { name: "Harshini Murugan", role: "Pre-med", quote: "Amazing help and support, was able to understand clearly. Very grateful that he managed to help me throughout this time.Thank you so much, Abhishek", rating: 5 },
  { name: "Abhishek Subramaniam", role: "Pre-med", quote: "It's an amazing company", rating: 5 },
];

/* ===== Course tiles (UI-only) ===== */
type CourseUI = {
  id: string; title: string; instructor: string; thumb: string;
  rating?: number; ratingCount?: number; price?: number; originalPrice?: number; isFree?: boolean; badge?: "Bestseller"|"Hot"|"New";
  hours?: number; level?: string;
};
const mk = (i:number):CourseUI => ({
  id:`c${i}`,
  title:["UCAT Masterclass 2025","OSCE Crash Course","Anatomy Made Simple","IELTS Writing Band 8+","Intro to Python","SQL for Analysts"][i%6],
  instructor:["Dr. Patel","Dr. Morgan","Arun D.","Mythri S.","Alex Chen"][i%5],
  thumb:"/images/course-placeholder.avif",
  rating:[4.8,4.7,4.6,4.9][i%4], ratingCount:[1234,987,543,2034][i%4],
  price:[19.99,14.99,0,29.99][i%4], originalPrice:[69.99,49.99,0,79.99][i%4],
  isFree:i%4===2,
  badge:(["Bestseller","Hot","New",undefined] as const)[i%4],
  hours:[12,7.5,5,18][i%4],
  level:["Beginner","Intermediate","All levels","Advanced"][i%4],
});
const TRENDING:CourseUI[] = Array.from({length:6},(_,i)=>mk(i));
const EXPLORE:CourseUI[]  = Array.from({length:12},(_,i)=>mk(i+10));

/* ===== Helpers ===== */
const SectionHeader = ({ title, subtitle, align="center" }: { title: string; subtitle?: string; align?: "center"|"left" }) => (
  <header className={`${align === "center" ? "text-center" : ""} space-y-2 mb-8`}>
    <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
    {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
  </header>
);

const Stars = ({ r=0 }:{r?:number}) => (
  <div className="flex items-center gap-1" aria-label={`${r} out of 5`}>
    <span className="text-[13px] font-semibold text-amber-700">{r.toFixed(1)}</span>
    <span className="text-yellow-500">★</span><span className="text-yellow-500">★</span>
    <span className="text-yellow-500">★</span><span className="text-yellow-500">★</span>
    <span className="text-yellow-500">☆</span>
  </div>
);

const Money = ({ price, original, included }:{price?:number; original?:number; included?:boolean}) => {
  if (included) return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-200">Included</span>;
  if (price===0) return <span className="font-semibold text-emerald-600">Free</span>;
  if (!price && !original) return <span className="font-semibold text-primary">Membership</span>;
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-semibold">£{price?.toFixed(2)}</span>
      {!!original && original > (price||0) && (
        <span className="text-sm text-muted-foreground line-through">£{original.toFixed(2)}</span>
      )}
    </div>
  );
};

const CourseCard = ({ c, included=false }: { c: CourseUI; included?: boolean }) => (
  <article className="group overflow-hidden rounded-xl ring-1 ring-black/5 bg-white transition hover:shadow-md">
    <div className="relative aspect-[16/9] bg-muted">
      <img src={c.thumb} alt="" loading="lazy" decoding="async"
           className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
      {c.badge && (
        <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-[11px] font-medium ring-1 ring-black/10">
          {c.badge}
        </span>
      )}
      <button aria-label="Wishlist" className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-sm shadow-sm opacity-0 group-hover:opacity-100 transition">♡</button>
    </div>
    <div className="p-4">
      <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{c.title}</h3>
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{c.instructor}</p>
      <div className="mt-2 flex items-center gap-2">
        <Stars r={c.rating}/><span className="text-xs text-muted-foreground">({c.ratingCount?.toLocaleString()})</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Money price={c.isFree?0:c.price} original={c.originalPrice} included={included}/>
        <span className="text-xs text-muted-foreground">{c.hours}h • {c.level}</span>
      </div>
    </div>
  </article>
);

/* Horizontal scroll without heavy arrows */
function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pr-2 no-scrollbar">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[rgba(250,250,250,1)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[rgba(250,250,250,1)] to-transparent" />
    </div>
  );
}

/* Reviews carousel (unchanged) */
function useVisibleCards() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const update = () => setN(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
    update(); window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return n;
}

// Add above ReviewsCarousel
function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  const [open, setOpen] = useState(false);
  const isLong = r.quote.length > 260; // tweak threshold as you like

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-primary/[0.03] p-6 ring-1 ring-black/5 flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center font-semibold">
          {r.name.split(" ").map((s) => s[0]).join("").slice(0,2)}
        </div>
        <div>
          <div className="font-medium">{r.name}</div>
          {/* <div className="text-xs text-muted-foreground">{r.role}</div> */}
        </div>
      </div>

      {/* Quote */}
      <div className="mt-4 relative">
        <p className={`text-sm leading-relaxed ${!open ? "line-clamp-5" : ""}`}>
          “{r.quote}”
        </p>

        {/* subtle fade when clamped */}
        {!open && isLong && (
          <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-8 bg-gradient-to-t from-[rgba(255,255,255,0.95)] to-transparent" />
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-amber-600 text-sm">
          {"★".repeat(Math.floor(r.rating))}{"☆".repeat(5 - Math.floor(r.rating))}
          <span className="text-muted-foreground"> ({r.rating}/5)</span>
        </div>

        {isLong && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {open ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}


function ReviewsCarousel({ items }: { items: typeof REVIEWS }) {
  const visible = useVisibleCards();
  const totalPages = Math.max(10, Math.ceil(items.length / visible));
  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => {
    if (prefReduced) return;
    const id = setInterval(() => setPage((p) => (p + 1) % totalPages), 6000);
    return () => clearInterval(id);
  }, [totalPages, prefReduced]);

  const go = (p: number) => setPage((p + totalPages) % totalPages);

  return (
    <section aria-label="Student reviews" className="relative">
      <div
        className="flex overflow-hidden rounded-2xl"
        onMouseEnter={() => !prefReduced && trackRef.current && (trackRef.current.style.scrollBehavior = "auto")}
        onMouseLeave={() => trackRef.current && (trackRef.current.style.scrollBehavior = "smooth")}
      >
        <div
          ref={trackRef}
          className="flex w-full transition-transform"
          style={{ transform: `translateX(-${(100 / visible) * page}%)` }}
        >
          {items.map((r, i) => (
  <article
    key={i}
    className="min-w-full md:min-w-1/2 lg:min-w-1/3 px-3"
    style={{ minWidth: `${100 / visible}%` }}
  >
    {/* remove fixed 'h-full' so cards aren't forced to the tallest one */}
    <ReviewCard r={r} />
  </article>
))}

        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button onClick={() => go(page - 1)} className="rounded-full border bg-white px-3 py-1 text-sm hover:bg-gray-50" aria-label="Previous">‹</button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full ${i === page ? "bg-primary" : "bg-gray-300"}`}
          />
        ))}
        <button onClick={() => go(page + 1)} className="rounded-full border bg-white px-3 py-1 text-sm hover:bg-gray-50" aria-label="Next">›</button>
      </div>
    </section>
  );
}

/* ===== Page ===== */
export default function Home() {
  const trending = useMemo(() => TRENDING, []);
  const explore = useMemo(() => EXPLORE, []);
  const { user, loading: authLoading } = useAuth();
  const { isActive: memberActive, loading: memLoading } = useMembership();

  // During initial load, render as guest to avoid layout jank.
  const state: 'GUEST' | 'USER_NO_MEM' | 'USER_MEM' =
    !user ? 'GUEST' : memberActive ? 'USER_MEM' : 'USER_NO_MEM';

  const heroTitle =
    state === 'USER_MEM' ? "Welcome back — all courses included" : "Low Cost, High Quality Education";

  return (
    <main className="space-y-20 md:space-y-24">
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-app grid items-center gap-8 py-12 md:grid-cols-2 md:py-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-black/10 px-3 py-1 text-xs md:text-sm text-muted-foreground">
              Low Cost • High Quality • Accessible
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{heroTitle}</h1>
            <p className="text-lg text-muted-foreground max-w-prose">
              World-class courses designed by industry experts — accessible anywhere, anytime. Learn at your pace and track your progress.
            </p>
            <div className="flex flex-wrap gap-3">
              {state === 'GUEST' && (
                <>
                  <Link to="/billing/plans"><Button size="lg">Subscribe</Button></Link>
                  <Link to="/courses"><Button size="lg" variant="secondary">Explore Courses</Button></Link>
                </>
              )}
              {state === 'USER_NO_MEM' && (
                <>
                  <Link to="/billing/plans"><Button size="lg">Get Lifetime</Button></Link>
                  <Link to="/courses"><Button size="lg" variant="secondary">Browse Courses</Button></Link>
                </>
              )}
              {state === 'USER_MEM' && (
                <>
                  <Link to="/me/enrollments"><Button size="lg">Go to My Learning</Button></Link>
                  <Link to="/courses"><Button size="lg" variant="secondary">Browse Courses</Button></Link>
                </>
              )}
            </div>

            {state !== 'USER_MEM' && (
              <ul className="mt-1 grid grid-cols-2 gap-2 text-sm text-muted-foreground md:flex md:flex-wrap md:gap-4">
                {CORE_FEATURES.map((f) => (
                  <li key={f.title} className="flex items-center gap-2"><span aria-hidden>{f.icon}</span>{f.title}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="aspect-video overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-xl">
              <img src="/images/hero-udemy.avif" alt="" className="h-full w-full object-cover" loading="eager" decoding="async"/>
            </div>
          </div>
        </div>
      </section>

      {/* Continue learning (only when logged in & has items) */}
      {state !== 'GUEST' && <ContinueLearningRail />}
      <UpcomingLiveSessions limit={6} />


      {/* TRENDING */}
      {/* <section className="container-app space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Trending now</h2>
            <p className="text-sm text-muted-foreground">
              {state === 'USER_MEM' ? 'All included with your membership' : 'Popular this week'}
            </p>
          </div>
          <Link to="/courses" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((c)=>(
            <Link key={c.id} to="/courses" className="block">
              <CourseCard c={c} included={state === 'USER_MEM'} />
            </Link>
          ))}
        </div>
      </section> */}

      {/* Explore (carousel) */}
      {/* <section className="bg-[rgba(245,247,250,0.6)]">
        <div className="container-app space-y-6 py-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Explore courses</h2>
              <p className="text-sm text-muted-foreground">
                {state === 'USER_MEM' ? 'Everything included — start any course' : 'Handpicked picks for you'}
              </p>
            </div>
            <Link to="/courses" className="text-sm font-medium text-primary hover:underline">Browse all</Link>
          </div>
          <HScroll>
            {explore.map((c)=>(
              <div key={c.id} className="min-w-[240px] max-w-[280px] flex-1 snap-start">
                <Link to="/courses" className="block"><CourseCard c={c} included={state === 'USER_MEM'} /></Link>
              </div>
            ))}
          </HScroll>
        </div>
      </section> */}

      {/* Why choose – hide for members */}
      {state !== 'USER_MEM' && (
        <section className="container-app py-10 md:py-14">
          <SectionHeader title="Why choose Educate The World" subtitle="Expert content, flexible formats, career outcomes." />
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-transparent p-4 md:p-5">
            <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 md:divide-x md:divide-black/10">
              {HIGHLIGHTS.map((h) => (
                <li key={h.title} className="flex items-center gap-3 md:px-6">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 backdrop-blur ring-1 ring-black/5">
                    <span aria-hidden className="text-base">{h.icon}</span>
                  </span>
                  <span className="font-medium leading-tight">{h.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Advantages – hide for members */}
      {/* {state !== 'USER_MEM' && (
        <section className="relative py-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60"
               style={{ background: "radial-gradient(1200px 400px at 20% 0%, rgba(16,185,129,.08), transparent 60%)" }} />
          <div className="container-app space-y-14">
            {ADVANTAGES.map((blk, i) => (
              <div key={blk.title} className="grid items-center gap-10 md:grid-cols-2">
                <div className={`relative ${i % 2 ? "md:order-2" : ""}`}>
                  <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/10 to-transparent blur-2xl" />
                  <div className="aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm">
                    <img src={blk.img} alt={blk.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </div>
                </div>
                <div className={`${i % 2 ? "md:order-1" : ""}`}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs ring-1 ring-black/5">
                    <span className="font-semibold">0{i + 1}</span> Program Advantage
                  </span>
                  <h3 className="mt-3 text-2xl md:text-3xl font-semibold">{blk.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {blk.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )} */}

      {/* Reviews – keep for all */}
      <section className="container-app">
        <SectionHeader title="What learners say" align="left" />
        <ReviewsCarousel items={REVIEWS}/>
      </section>

      {/* FAQ – hide for members */}
      {state !== 'USER_MEM' && (
        <section className="container-app">
          <SectionHeader title="Frequently Asked Questions" subtitle="Everything you need to know before you start." />
          <div className="mx-auto max-w-3xl rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden">
            {FAQS.map((f, i) => (
              <details key={i} className="group border-b last:border-b-0 open:bg-primary/[0.02]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                  <span className="font-medium">{f.q}</span>
                  <svg className="h-4 w-4 transition-transform group-open:rotate-45" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Community ribbon – tweak CTAs per state */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container-app py-12">
          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Be part of the Educate the World community
              </h3>
              <p className="mt-2 text-muted-foreground">
                Connect with peers, mentors, and alumni. Share progress, ask questions, and grow together.
              </p>
              <div className="mt-4">
                {state === 'GUEST' && <Link to="/register"><Button>Register Now</Button></Link>}
                {state === 'USER_NO_MEM' && <Link to="/courses"><Button>Browse Courses</Button></Link>}
                {state === 'USER_MEM' && <Link to="/courses"><Button>Invite a friend</Button></Link>}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="https://chat.whatsapp.com/J7VsK9IUuP6CQypYRIlyJC" target="_blank" rel="noreferrer"
                 className="rounded-full border bg-white px-5 py-2 text-sm hover:bg-gray-50">
                For a career in Medicine
              </a>
              <a href="https://chat.whatsapp.com/D8NOwTp38XfANaWLWnrclv" target="_blank" rel="noreferrer"
                 className="rounded-full border bg-white px-5 py-2 text-sm hover:bg-gray-50">
                Information on University courses
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Global CSS (if not already present)
.container-app { @apply mx-auto max-w-[1180px] px-4 md:px-6; }
.no-scrollbar { scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }
*/
