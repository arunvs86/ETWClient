// import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import { GraduationCap, BookOpen, Calendar, Phone, Mail, MessageCircle, X } from "lucide-react";

// type ModalKind = "about" | "terms" | "privacy" | "contact" | null;

// type ModalProps = {
//   open: boolean;
//   title: string;
//   onClose: () => void;
//   children: React.ReactNode;
// };

// /** Accessible, lightweight modal (Esc, backdrop click, focus trap entry). */
// function LegalModal({ open, title, onClose, children }: ModalProps) {
//   const dialogRef = useRef<HTMLDivElement | null>(null);

//   // Close on ESC
//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, onClose]);

//   // Focus the dialog when opened
//   useEffect(() => {
//     if (open && dialogRef.current) dialogRef.current.focus();
//   }, [open]);

//   if (!open) return null;

//   return (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center"
//       aria-labelledby="modal-title"
//       role="dialog"
//       aria-modal="true"
//     >
//       {/* Backdrop */}
//       <button
//         aria-hidden
//         className="absolute inset-0 bg-black/50"
//         onClick={onClose}
//         tabIndex={-1}
//       />
//       {/* Panel */}
//       <div
//         ref={dialogRef}
//         tabIndex={-1}
//         className="relative mx-4 w-full max-w-3xl rounded-2xl bg-white shadow-2xl outline-none"
//       >
//         <header className="flex items-center justify-between border-b px-5 py-4">
//           <h2 id="modal-title" className="text-lg font-semibold">
//             {title}
//           </h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring"
//             aria-label="Close"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </header>

//         <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm leading-6 text-gray-800">
//           {children}
//         </div>

//         <footer className="flex justify-end gap-2 border-t px-5 py-3">
//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
//           >
//             Close
//           </button>
//         </footer>
//       </div>
//     </div>
//   );
// }

// export default function Footer() {
//   const year = new Date().getFullYear();
//   const [modal, setModal] = useState<ModalKind>(null);

//   // helper to style buttons like links
//   const linkBtn =
//     "text-blue-600 hover:underline inline-flex items-center gap-2 focus:outline-none";

//   return (
//     <footer className="mt-16 border-t bg-white" role="contentinfo">
//       <nav aria-label="Footer" className="container-app py-12 px-4 sm:px-6 lg:px-8">
//         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
//           {/* Brand */}
//           <div className="lg:col-span-1">
//             <div className="flex items-center gap-2">
//               <img src="/images/logo.webp" alt="ETW" className="h-8 w-auto" />
//               <span className="font-semibold">Educate The World</span>
//             </div>
//             <p className="mt-3 text-sm text-gray-600">
//               Quality learning, accessible to everyone.
//             </p>
//           </div>

//           {/* Company */}
//           <div>
//             <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Company</h3>
//             <ul className="mt-3 space-y-2 text-gray-700">
//               <li>
//                 <button
//                   type="button"
//                   onClick={() => setModal("about")}
//                   className={linkBtn}
//                 >
//                   <BookOpen className="h-4 w-4" /> About
//                 </button>
//               </li>
//               <li>
//                 <Link to="/live" className="text-blue-600 hover:underline inline-flex items-center gap-2">
//                   <GraduationCap className="h-4 w-4" /> Courses
//                 </Link>
//               </li>
//               {/* <li>
//                 <Link to="/events" className="text-blue-600 hover:underline inline-flex items-center gap-2">
//                   <Calendar className="h-4 w-4" /> Events
//                 </Link>
//               </li> */}
//               <li>
//                 <button
//                   type="button"
//                   onClick={() => setModal("contact")}
//                   className={linkBtn}
//                 >
//                   <MessageCircle className="h-4 w-4" /> Contact Us
//                 </button>
//               </li>
//             </ul>
//           </div>

//           {/* For Students */}
//           <div>
//             <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For Students</h3>
//             <ul className="mt-3 space-y-2 text-gray-700">
//               <li>
//                 <Link to="/login" className="text-blue-600 hover:underline inline-flex items-center gap-2">
//                   <MessageCircle className="h-4 w-4" /> Student Login
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/courses?category=medicine" className="text-blue-600 hover:underline inline-flex items-center gap-2">
//                   <GraduationCap className="h-4 w-4" /> Career in Medicine
//                 </Link>
//               </li>
//               <li>
//                 <button
//                   type="button"
//                   onClick={() => setModal("terms")}
//                   className={linkBtn}
//                 >
//                   <BookOpen className="h-4 w-4" /> Terms &amp; Conditions
//                 </button>
//               </li>
//             </ul>
//           </div>

//           {/* For Tutors */}
//           <div>
//             <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For Tutors</h3>
//             <ul className="mt-3 space-y-2 text-gray-700">
//               <li>
//                 <Link to="/teach" className="text-blue-600 hover:underline inline-flex items-center gap-2">
//                   <GraduationCap className="h-4 w-4" /> Tutors Login
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Connect with us */}
//           <div>
//             <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Connect with us</h3>
//             <ul className="mt-3 space-y-2">
//               <li>
//                 <a
//                   className="text-blue-600 hover:underline inline-flex items-center gap-2"
//                   href="https://wa.me/447958913329"
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   <MessageCircle className="h-4 w-4" /> WhatsApp
//                 </a>
//               </li>
//               <li>
//                 <a className="text-blue-600 hover:underline inline-flex items-center gap-2" href="tel:+447958913329">
//                   <Phone className="h-4 w-4" /> 07958913329
//                 </a>
//               </li>
//               <li className="pt-2">
//                 <div className="text-sm font-semibold">Email</div>
//                 <a className="text-blue-600 hover:underline inline-flex items-center gap-2" href="mailto:educatemedicalllp@gmail.com">
//                   <Mail className="h-4 w-4" /> educatemedicalllp@gmail.com
//                 </a>
//               </li>
//               <li className="pt-2">
//                 <a
//                   className="text-sm underline hover:no-underline"
//                   href="https://chat.whatsapp.com/IlVXTYgZIxCCOKMV9jtQjY"
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   Join our WhatsApp group
//                 </a>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>

//       <div className="border-t border-gray-100">
//         <div className="container-app py-4 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <span>© {year} Educate The World</span>
//           <button
//             type="button"
//             onClick={() => setModal("privacy")}
//             className="text-blue-600 hover:underline text-left"
//           >
//             Privacy
//           </button>
//         </div>
//       </div>

//       {/* ABOUT MODAL (formatted) */}
//       <LegalModal open={modal === "about"} title="About Us" onClose={() => setModal(null)}>
//         <article className="prose prose-sm max-w-none">
//           <h3>Our Purpose</h3>
//           <p>
//             Education plays a significant role in the progress of the human race. A good education
//             improves self-esteem, broadens career prospects, and deepens our understanding of the world
//             and the people in it. With this in mind, we began running career events, medical university
//             entry seminars, and training in <strong>2018</strong>.
//           </p>

//           <h4>Our Journey</h4>
//           <p>
//             Since 2018, our focus has been on making quality learning accessible to everyone. We connect
//             learners with opportunities, information, and mentors who can help them shape a meaningful career path.
//           </p>

//           <h4>Message from the Founder</h4>
//           <p>
//             Regards,<br />
//             <strong>Dr Ezhil Anand</strong>
//           </p>

//           <hr />

//           <h4>Contact Us</h4>
//           <p>
//             If you have any questions, please email{" "}
//             <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">
//               educatemedicalllp@gmail.com
//             </a>{" "}
//             or WhatsApp{" "}
//             <a
//               className="text-blue-600 underline"
//               href="https://wa.me/447958913329"
//               target="_blank"
//               rel="noreferrer"
//             >
//               07958913329
//             </a>
//             . We aim to respond within <strong>72 hours</strong>.
//           </p>
//           <p>
//             Regards,<br />
//             <strong>Priya (Skillet)</strong><br />
//             Operations Manager, EducateTheWorld
//           </p>

//           <p>
//             <a
//               className="inline-flex items-center gap-2 text-blue-600 underline"
//               href="https://chat.whatsapp.com/IlVXTYgZIxCCOKMV9jtQjY"
//               target="_blank"
//               rel="noreferrer"
//             >
//               <MessageCircle className="h-4 w-4" />
//               Join our WhatsApp group
//             </a>
//           </p>
//         </article>
//       </LegalModal>

//       {/* TERMS MODAL (formatted, includes Terms & Use sections you provided) */}
//       <LegalModal open={modal === "terms"} title="Terms & Conditions" onClose={() => setModal(null)}>
//         <article className="prose prose-sm max-w-none">
//           <h3>Important Notice</h3>
//           <p>
//             Please read carefully before purchasing admission or enrolling for any events, coaching,
//             workshops, or seminars from this website. By proceeding with a purchase, you agree to these
//             Terms and Conditions of Service.
//           </p>

//           <h4>1. Application</h4>
//           <p>
//             These Terms and Conditions apply to the provision of services by Educate Medical LLP (“EM”),
//             14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE.
//           </p>

//           <h4>2. Interpretation</h4>
//           <ul>
//             <li><strong>Agreement</strong>: These Terms and Conditions + (i) signed Contract for Services or (ii) completed Online Booking.</li>
//             <li><strong>Business Day</strong>: A day (Mon–Fri) other than UK public holidays.</li>
//             <li><strong>Customer</strong>: The purchaser of Services from EM.</li>
//             <li><strong>Services</strong>: In-house or Public events, seminars, workshops, or coaching as described in the booking/contract.</li>
//             <li><strong>Charges</strong>: Fees payable for the Services.</li>
//             <li><strong>Exceptional Circumstances</strong>: Rare, unforeseeable, and beyond the control of the parties.</li>
//           </ul>

//           <h4>3. Basis of These Terms and Conditions</h4>
//           <ul>
//             <li>Effective upon completion of the Online Booking or signature of the Contract for Services.</li>
//             <li>Marketing descriptions are illustrative only and non-contractual.</li>
//             <li>Customer terms do not apply unless expressly agreed in writing.</li>
//           </ul>

//           <h4>4. Supply of Service</h4>
//           <ul>
//             <li>EM may change content at any time; dates are indicative and may change.</li>
//             <li>EM may amend to comply with laws; EM may cancel and offer dates/refund/credit.</li>
//             <li>Services are for the named Customer/delegate unless EM approves transfer.</li>
//           </ul>

//           <h4>5. Customer Obligations</h4>
//           <ul>
//             <li>Cooperate, provide accurate delegate info, and ensure facilities (for in-house) or connectivity (for online).</li>
//             <li>Keep credentials confidential; ensure appropriate conduct of delegates.</li>
//             <li>Send grievances to <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a> or the postal address; EM aims to respond within 30 working days.</li>
//           </ul>

//           <h4>6. Charges &amp; Payment</h4>
//           <ul>
//             <li>Fees typically per session per delegate; due within 30 calendar days and prior to Services.</li>
//             <li>Non-payment may lead to withdrawal, cessation, or withholding certificates.</li>
//             <li>Late interest at 4% above Bank of England base rate; sums paid in full without set-off.</li>
//           </ul>

//           <h4>7. Cancellation</h4>
//           <ul>
//             <li>&gt; 60 days before start: 50% of Charge; ≤ 60 days: 100% of Charge.</li>
//             <li>No-shows: no refunds. EM cancellations: alternative date/refund/credit.</li>
//             <li>Exceptional cases considered at EM’s discretion.</li>
//           </ul>

//           <h4>8. Intellectual Property</h4>
//           <ul>
//             <li>All IP in materials remains with EM; licensed for use solely in connection with the Services.</li>
//             <li>Third-party IP subject to licensors’ permissions.</li>
//           </ul>

//           <h4>9. Confidentiality</h4>
//           <p>Mutual confidentiality obligations during the Agreement and for five (5) years thereafter, save as required by law.</p>

//           <h4>10. Limitation of Liability</h4>
//           <ul>
//             <li>Nothing excludes liability for death/personal injury due to negligence or fraud.</li>
//             <li>No liability for indirect/consequential loss; overall liability capped at Charges paid.</li>
//             <li>Services provided “as is”; third-party performance not guaranteed.</li>
//           </ul>

//           <h4>11. Data Protection</h4>
//           <p>
//             Parties shall comply with applicable Data Protection Legislation (e.g., GDPR &amp; DPA 2018). EM will implement
//             appropriate technical/organizational measures and notify of breaches without undue delay.
//           </p>

//           <h4>12. Miscellaneous</h4>
//           <ul>
//             <li>Assignment/ subcontracting rights (EM) and restrictions (Customer).</li>
//             <li>Force Majeure, notices, entire agreement, variation, waiver, severability.</li>
//             <li>Third-party rights excluded (Contracts (Rights of Third Parties) Act 1999).</li>
//           </ul>

//           <h4>Governing Law &amp; Jurisdiction</h4>
//           <p>England &amp; Wales law governs; courts of England &amp; Wales have exclusive jurisdiction.</p>

//           <h4>Acceptance</h4>
//           <p>By clicking “I Accept” or purchasing/enrolling, you agree to be bound by these Terms.</p>

//           <hr />

//           <h3>Terms of Use (Website)</h3>
//           <p className="mt-0">
//             Last Updated: May 2024
//           </p>
//           <ol>
//             <li><strong>Acceptance of Terms</strong> — You confirm you are 18+ or authorized to bind your organization.</li>
//             <li><strong>Changes</strong> — We may revise these Terms; continued use means acceptance.</li>
//             <li><strong>Access</strong> — Limited, non-exclusive, revocable license for personal, non-commercial use.</li>
//             <li>
//               <strong>Use of Site</strong> — No unlawful use, malware, scraping, DoS, or interference; no impersonation.
//             </li>
//             <li>
//               <strong>User Accounts</strong> — Keep credentials confidential; notify us of unauthorized use.
//             </li>
//             <li>
//               <strong>Intellectual Property</strong> — All content and marks are owned by EM or licensors; all rights reserved.
//             </li>
//             <li>
//               <strong>Reliance</strong> — Content is general information; obtain professional advice where needed.
//             </li>
//             <li>
//               <strong>Limitation of Liability</strong> — To the fullest extent permitted by law as described above.
//             </li>
//             <li>
//               <strong>Indemnification</strong> — You indemnify EM for breaches and improper use.
//             </li>
//             <li>
//               <strong>User-Generated Content</strong> — You grant a worldwide, sublicensable license to your submissions.
//             </li>
//             <li>
//               <strong>Privacy &amp; Cookies</strong> — Governed by our Privacy Notice and Cookie Policy.
//             </li>
//             <li>
//               <strong>Termination</strong> — We may suspend or terminate access at any time for breach.
//             </li>
//             <li>
//               <strong>Governing Law</strong> — England &amp; Wales; courts of England &amp; Wales have exclusive jurisdiction.
//             </li>
//           </ol>

//           <h4>Contact</h4>
//           <p>
//             <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a><br />
//             14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE
//           </p>
//         </article>
//       </LegalModal>

//       {/* PRIVACY & COOKIES MODAL (formatted) */}
//       <LegalModal open={modal === "privacy"} title="Privacy Notice & Cookie Policy" onClose={() => setModal(null)}>
//         <article className="prose prose-sm max-w-none">
//           <h3>Privacy Notice</h3>
//           <p className="mt-0"><em>Last Updated: May 2024</em></p>

//           <h4>Introduction</h4>
//           <p>
//             Educate Medical LLP (“we”, “us”, “our”) is committed to protecting and respecting your privacy.
//             This notice explains how we collect, use, disclose, and safeguard your information when you
//             visit <strong>https://educatetheworld.co.uk/</strong>.
//           </p>

//           <h4>Who We Are</h4>
//           <p>
//             Educate Medical LLP, 14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE.
//           </p>

//           <h4>Information We Collect</h4>
//           <ul>
//             <li><strong>Personal Data</strong>: identity, contact, profile, usage, and technical data.</li>
//             <li><strong>Non-personal Data</strong>: aggregated/analytics data and preferences.</li>
//           </ul>

//           <h4>How We Use Your Information</h4>
//           <ul>
//             <li>Provide, operate, and maintain our Site and services.</li>
//             <li>Improve and personalize user experience; develop new features.</li>
//             <li>Communicate updates, support, and marketing (where permitted).</li>
//             <li>Process transactions and manage orders.</li>
//             <li>Comply with legal obligations.</li>
//           </ul>

//           <h4>Legal Bases for Processing</h4>
//           <ul>
//             <li>Consent</li>
//             <li>Contract</li>
//             <li>Legal obligation</li>
//             <li>Legitimate interests</li>
//           </ul>

//           <h4>Sharing Your Information</h4>
//           <ul>
//             <li>With service providers acting on our behalf.</li>
//             <li>With consent, or where required by law.</li>
//             <li>To protect our rights, property, or safety.</li>
//           </ul>

//           <h4>Data Security &amp; Retention</h4>
//           <p>
//             We implement appropriate technical and organizational measures. We retain personal data only
//             as long as necessary for the purposes collected and to meet legal requirements.
//           </p>

//           <h4>Your Rights</h4>
//           <ul>
//             <li>Access, rectification, erasure, restriction, objection, portability.</li>
//             <li>We aim to respond within one month of receiving a valid request.</li>
//           </ul>

//           <h4>Changes to This Notice</h4>
//           <p>We may update this notice from time to time and will post the latest version on this page.</p>

//           <h4>Contact</h4>
//           <p>
//             <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a><br />
//             14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE
//           </p>

//           <hr />

//           <h3>Cookie Policy</h3>
//           <p className="mt-0"><em>Last Updated: May 2024</em></p>

//           <h4>What Are Cookies?</h4>
//           <p>
//             Cookies are small text files stored on your device. They help websites function, improve
//             performance, and provide analytics for site owners.
//           </p>

//           <h4>Types of Cookies We Use</h4>
//           <ul>
//             <li><strong>Essential</strong> — Required for core functionality (e.g., login, preferences).</li>
//             <li><strong>Analytical/Performance</strong> — Understand traffic and navigation to improve the Site.</li>
//             <li><strong>Functionality</strong> — Remember preferences (e.g., language, region).</li>
//             <li><strong>Targeting</strong> — Record pages visited/links followed; may be shared with third parties.</li>
//           </ul>

//           <h4>Third-Party Cookies</h4>
//           <p>
//             We may use third-party cookies for analytics, ads, and performance. These are governed by the
//             providers’ own privacy policies.
//           </p>

//           <h4>How We Use Cookies</h4>
//           <ul>
//             <li>Remember preferences and help process logins/transactions.</li>
//             <li>Measure traffic and interactions for better tools and experiences.</li>
//             <li>Track campaigns and search engine performance.</li>
//           </ul>

//           <h4>Your Choices</h4>
//           <p>
//             You can manage cookies in your browser settings (allow, block, or delete). Blocking all cookies
//             may impact essential Site functions.
//           </p>

//           <h4>Changes to the Cookie Policy</h4>
//           <p>We may update this Cookie Policy; please review it periodically for changes.</p>

//           <h4>Contact</h4>
//           <p>
//             <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a><br />
//             14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE
//           </p>
//         </article>
//       </LegalModal>

//       {/* CONTACT MODAL (unchanged visual, consistent style) */}
//       <LegalModal open={modal === "contact"} title="Contact Us" onClose={() => setModal(null)}>
//         <div className="prose prose-sm max-w-none">
//           <p>We’d love to hear from you. Reach out via any of the channels below.</p>

//           <p className="flex items-center gap-2">
//             <Mail className="h-4 w-4" />
//             <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">
//               educatemedicalllp@gmail.com
//             </a>
//           </p>
//           <p className="flex items-center gap-2">
//             <Phone className="h-4 w-4" />
//             <a className="text-blue-600 underline" href="tel:+447958913329">
//               07958913329
//             </a>
//           </p>
//           <p className="flex items-center gap-2">
//             <MessageCircle className="h-4 w-4" />
//             <a
//               className="text-blue-600 underline"
//               href="https://wa.me/447958913329"
//               target="_blank"
//               rel="noreferrer"
//             >
//               WhatsApp us
//             </a>
//           </p>

//           <p>
//             <a
//               className="inline-flex items-center gap-2 text-blue-600 underline"
//               href="https://chat.whatsapp.com/IlVXTYgZIxCCOKMV9jtQjY"
//               target="_blank"
//               rel="noreferrer"
//             >
//               <MessageCircle className="h-4 w-4" />
//               Join our WhatsApp group
//             </a>
//           </p>

//           <p className="text-xs text-gray-500">We aim to respond within 72 hours.</p>
//         </div>
//       </LegalModal>
//     </footer>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Calendar, Phone, Mail, MessageCircle, X, Smartphone } from "lucide-react";

type ModalKind = "about" | "terms" | "privacy" | "contact" | null;

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function LegalModal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" aria-modal="true" role="dialog">
      <button aria-hidden className="absolute inset-0 bg-black/50" onClick={onClose} tabIndex={-1} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative mx-4 w-full max-w-3xl rounded-2xl bg-white shadow-2xl outline-none"
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm leading-6 text-gray-800">{children}</div>
        <footer className="flex justify-end border-t px-5 py-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [modal, setModal] = useState<ModalKind>(null);
  const linkBtn = "text-blue-600 hover:underline inline-flex items-center gap-2 focus:outline-none";

  return (
    <footer className="mt-16 border-t bg-white" role="contentinfo">
     <nav aria-label="Footer" className="container-app py-12 px-4 sm:px-6 lg:px-8">
  <div className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-6">
    {/* Brand */}
    <div className="flex flex-col space-y-3 lg:col-span-1">
      <div className="flex items-center gap-2">
        <img src="/images/logo.webp" alt="ETW" className="h-8 w-auto" />
        <span className="font-semibold">Educate The World</span>
      </div>
      <p className="text-sm text-gray-600">
        Quality learning, accessible to everyone.
      </p>
    </div>

    {/* Company */}
    <div className="flex flex-col space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Company
      </h3>
      <ul className="space-y-2 text-gray-700">
        <li>
          <button onClick={() => setModal("about")} className={linkBtn}>
            <BookOpen className="h-4 w-4" /> About
          </button>
        </li>
        <li>
          <Link
            to="/courses"
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" /> Courses
          </Link>
        </li>
        <li>
          <Link
            to="/events"
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" /> Events
          </Link>
        </li>
        <li>
          <button onClick={() => setModal("contact")} className={linkBtn}>
            <MessageCircle className="h-4 w-4" /> Contact Us
          </button>
        </li>
      </ul>
    </div>

    {/* For Students */}
    <div className="flex flex-col space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        For Students
      </h3>
      <ul className="space-y-2 text-gray-700">
        <li>
          <Link
            to="/login"
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" /> Student Login
          </Link>
        </li>
        <li>
          <Link
            to="/courses?category=medicine"
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" /> Career in Medicine
          </Link>
        </li>
        <li>
          <button onClick={() => setModal("terms")} className={linkBtn}>
            <BookOpen className="h-4 w-4" /> Terms &amp; Conditions
          </button>
        </li>
      </ul>
    </div>

    {/* For Tutors */}
    <div className="flex flex-col space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        For Tutors
      </h3>
      <ul className="space-y-2 text-gray-700">
        <li>
          <Link
            to="/teach"
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" /> Tutors Login
          </Link>
        </li>
      </ul>
    </div>

    {/* Connect */}
    <div className="flex flex-col space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Connect
      </h3>
      <ul className="space-y-2">
        <li>
          <a
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
            href="https://wa.me/447958913329"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </li>
        <li>
          <a
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
            href="tel:+447958913329"
          >
            <Phone className="h-4 w-4" /> 07958913329
          </a>
        </li>
        <li>
          <a
            className="text-blue-600 mt-3 hover:underline inline-flex items-center gap-2"
            href="mailto:educatemedicalllp@gmail.com"
          >
            <Mail className="h-4 w-4" /> educatemedicalllp@gmail.com
          </a>
        </li>
        <li>
          <a
            className="text-sm underline hover:no-underline"
            href="https://chat.whatsapp.com/IlVXTYgZIxCCOKMV9jtQjY"
            target="_blank"
            rel="noreferrer"
          >
            Join our WhatsApp group
          </a>
        </li>
      </ul>
    </div>

    {/* Get the App */}
    {/* Get the App */}
<div className="flex flex-col space-y-2">
  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
    Get the App
  </h3>
  <p className="text-base font-medium text-gray-900 leading-tight">
    EducateTheWorld
  </p>
  <div className="flex items-center gap-3 pt-1">
    <a
      href="https://play.google.com/store/apps/details?id=com.educatetheworld"
      target="_blank"
      rel="noreferrer"
      aria-label="Get it on Google Play"
    >
      <img
        src="/images/google-play-badge.svg"
        alt="Get it on Google Play"
        className="block h-[80px] w-auto object-contain hover:opacity-90"
      />
    </a>
    <a
      href="https://apps.apple.com/app/educatetheworld/id1234567890"
      target="_blank"
      rel="noreferrer"
      aria-label="Download on the App Store"
    >
      <img
        src="/images/app-store-badge.png"
        alt="Download on the App Store"
        className="block h-[80px] w-auto object-contain hover:opacity-90"
      />
    </a>
  </div>
</div>

  </div>
</nav>



      <div className="border-t border-gray-100">
        <div className="container-app py-4 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Educate The World</span>
          <button onClick={() => setModal("privacy")} className="text-blue-600 hover:underline text-left">
            Privacy
          </button>
        </div>
      </div>

      {/* Modals */}
      {/* (Keep your About / Terms / Privacy / Contact modals here as you already have them formatted) */}
      {/* ABOUT MODAL (formatted) */}
       <LegalModal open={modal === "about"} title="About Us" onClose={() => setModal(null)}>
         <article className="prose prose-sm max-w-none">
           <h3>Our Purpose</h3>
           <p>
             Education plays a significant role in the progress of the human race. A good education
             improves self-esteem, broadens career prospects, and deepens our understanding of the world
             and the people in it. With this in mind, we began running career events, medical university
             entry seminars, and training in <strong>2018</strong>.
           </p>

           <h4>Our Journey</h4>
           <p>
             Since 2018, our focus has been on making quality learning accessible to everyone. We connect
             learners with opportunities, information, and mentors who can help them shape a meaningful career path.
           </p>

           <h4>Message from the Founder</h4>
           <p>
             Regards,<br />
             <strong>Dr Ezhil Anand</strong>
           </p>

           <hr />

           <h4>Contact Us</h4>
           <p>
             If you have any questions, please email{" "}
             <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">
               educatemedicalllp@gmail.com
             </a>{" "}
             or WhatsApp{" "}
             <a
              className="text-blue-600 underline"
              href="https://wa.me/447958913329"
              target="_blank"
              rel="noreferrer"
            >
              07958913329
            </a>
            . We aim to respond within <strong>72 hours</strong>.
          </p>
          <p>
            Regards,<br />
            <strong>Priya (Skillet)</strong><br />
            Operations Manager, EducateTheWorld
          </p>

          <p>
            <a
              className="inline-flex items-center gap-2 text-blue-600 underline"
              href="https://chat.whatsapp.com/IlVXTYgZIxCCOKMV9jtQjY"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Join our WhatsApp group
            </a>
          </p>
        </article>
      </LegalModal>

      {/* TERMS MODAL (formatted, includes Terms & Use sections you provided) */}
      <LegalModal open={modal === "terms"} title="Terms & Conditions" onClose={() => setModal(null)}>
        <article className="prose prose-sm max-w-none">
          <h3>Important Notice</h3>
          <p>
            Please read carefully before purchasing admission or enrolling for any events, coaching,
            workshops, or seminars from this website. By proceeding with a purchase, you agree to these
            Terms and Conditions of Service.
          </p>

          <h4>1. Application</h4>
          <p>
            These Terms and Conditions apply to the provision of services by Educate Medical LLP (“EM”),
            14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE.
          </p>

          <h4>2. Interpretation</h4>
          <ul>
            <li><strong>Agreement</strong>: These Terms and Conditions + (i) signed Contract for Services or (ii) completed Online Booking.</li>
            <li><strong>Business Day</strong>: A day (Mon–Fri) other than UK public holidays.</li>
            <li><strong>Customer</strong>: The purchaser of Services from EM.</li>
            <li><strong>Services</strong>: In-house or Public events, seminars, workshops, or coaching as described in the booking/contract.</li>
            <li><strong>Charges</strong>: Fees payable for the Services.</li>
            <li><strong>Exceptional Circumstances</strong>: Rare, unforeseeable, and beyond the control of the parties.</li>
          </ul>

          <h4>3. Basis of These Terms and Conditions</h4>
          <ul>
            <li>Effective upon completion of the Online Booking or signature of the Contract for Services.</li>
            <li>Marketing descriptions are illustrative only and non-contractual.</li>
            <li>Customer terms do not apply unless expressly agreed in writing.</li>
          </ul>

          <h4>4. Supply of Service</h4>
          <ul>
            <li>EM may change content at any time; dates are indicative and may change.</li>
            <li>EM may amend to comply with laws; EM may cancel and offer dates/refund/credit.</li>
            <li>Services are for the named Customer/delegate unless EM approves transfer.</li>
          </ul>

          <h4>5. Customer Obligations</h4>
          <ul>
            <li>Cooperate, provide accurate delegate info, and ensure facilities (for in-house) or connectivity (for online).</li>
            <li>Keep credentials confidential; ensure appropriate conduct of delegates.</li>
            <li>Send grievances to <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a> or the postal address; EM aims to respond within 30 working days.</li>
          </ul>

          <h4>6. Charges &amp; Payment</h4>
          <ul>
            <li>Fees typically per session per delegate; due within 30 calendar days and prior to Services.</li>
            <li>Non-payment may lead to withdrawal, cessation, or withholding certificates.</li>
            <li>Late interest at 4% above Bank of England base rate; sums paid in full without set-off.</li>
          </ul>

          <h4>7. Cancellation</h4>
          <ul>
            <li>&gt; 60 days before start: 50% of Charge; ≤ 60 days: 100% of Charge.</li>
            <li>No-shows: no refunds. EM cancellations: alternative date/refund/credit.</li>
            <li>Exceptional cases considered at EM’s discretion.</li>
          </ul>

          <h4>8. Intellectual Property</h4>
          <ul>
            <li>All IP in materials remains with EM; licensed for use solely in connection with the Services.</li>
            <li>Third-party IP subject to licensors’ permissions.</li>
          </ul>

          <h4>9. Confidentiality</h4>
          <p>Mutual confidentiality obligations during the Agreement and for five (5) years thereafter, save as required by law.</p>

          <h4>10. Limitation of Liability</h4>
          <ul>
            <li>Nothing excludes liability for death/personal injury due to negligence or fraud.</li>
            <li>No liability for indirect/consequential loss; overall liability capped at Charges paid.</li>
            <li>Services provided “as is”; third-party performance not guaranteed.</li>
          </ul>

          <h4>11. Data Protection</h4>
          <p>
            Parties shall comply with applicable Data Protection Legislation (e.g., GDPR &amp; DPA 2018). EM will implement
            appropriate technical/organizational measures and notify of breaches without undue delay.
          </p>

          <h4>12. Miscellaneous</h4>
          <ul>
            <li>Assignment/ subcontracting rights (EM) and restrictions (Customer).</li>
            <li>Force Majeure, notices, entire agreement, variation, waiver, severability.</li>
            <li>Third-party rights excluded (Contracts (Rights of Third Parties) Act 1999).</li>
          </ul>

          <h4>Governing Law &amp; Jurisdiction</h4>
          <p>England &amp; Wales law governs; courts of England &amp; Wales have exclusive jurisdiction.</p>

          <h4>Acceptance</h4>
          <p>By clicking “I Accept” or purchasing/enrolling, you agree to be bound by these Terms.</p>

          <hr />

          <h3>Terms of Use (Website)</h3>
          <p className="mt-0">
            Last Updated: May 2024
          </p>
          <ol>
            <li><strong>Acceptance of Terms</strong> — You confirm you are 18+ or authorized to bind your organization.</li>
            <li><strong>Changes</strong> — We may revise these Terms; continued use means acceptance.</li>
            <li><strong>Access</strong> — Limited, non-exclusive, revocable license for personal, non-commercial use.</li>
            <li>
              <strong>Use of Site</strong> — No unlawful use, malware, scraping, DoS, or interference; no impersonation.
            </li>
            <li>
              <strong>User Accounts</strong> — Keep credentials confidential; notify us of unauthorized use.
            </li>
            <li>
              <strong>Intellectual Property</strong> — All content and marks are owned by EM or licensors; all rights reserved.
            </li>
            <li>
              <strong>Reliance</strong> — Content is general information; obtain professional advice where needed.
            </li>
            <li>
              <strong>Limitation of Liability</strong> — To the fullest extent permitted by law as described above.
            </li>
            <li>
              <strong>Indemnification</strong> — You indemnify EM for breaches and improper use.
            </li>
            <li>
              <strong>User-Generated Content</strong> — You grant a worldwide, sublicensable license to your submissions.
            </li>
            <li>
              <strong>Privacy &amp; Cookies</strong> — Governed by our Privacy Notice and Cookie Policy.
            </li>
            <li>
              <strong>Termination</strong> — We may suspend or terminate access at any time for breach.
            </li>
            <li>
              <strong>Governing Law</strong> — England &amp; Wales; courts of England &amp; Wales have exclusive jurisdiction.
            </li>
          </ol>

          <h4>Contact</h4>
          <p>
            <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a><br />
            14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE
          </p>
        </article>
      </LegalModal>

      {/* PRIVACY & COOKIES MODAL (formatted) */}
      <LegalModal open={modal === "privacy"} title="Privacy Notice & Cookie Policy" onClose={() => setModal(null)}>
        <article className="prose prose-sm max-w-none">
          <h3>Privacy Notice</h3>
          <p className="mt-0"><em>Last Updated: May 2024</em></p>

          <h4>Introduction</h4>
          <p>
            Educate Medical LLP (“we”, “us”, “our”) is committed to protecting and respecting your privacy.
            This notice explains how we collect, use, disclose, and safeguard your information when you
            visit <strong>https://educatetheworld.co.uk/</strong>.
          </p>

          <h4>Who We Are</h4>
          <p>
            Educate Medical LLP, 14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE.
          </p>

          <h4>Information We Collect</h4>
          <ul>
            <li><strong>Personal Data</strong>: identity, contact, profile, usage, and technical data.</li>
            <li><strong>Non-personal Data</strong>: aggregated/analytics data and preferences.</li>
          </ul>

          <h4>How We Use Your Information</h4>
          <ul>
            <li>Provide, operate, and maintain our Site and services.</li>
            <li>Improve and personalize user experience; develop new features.</li>
            <li>Communicate updates, support, and marketing (where permitted).</li>
            <li>Process transactions and manage orders.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h4>Legal Bases for Processing</h4>
          <ul>
            <li>Consent</li>
            <li>Contract</li>
            <li>Legal obligation</li>
            <li>Legitimate interests</li>
          </ul>

          <h4>Sharing Your Information</h4>
          <ul>
            <li>With service providers acting on our behalf.</li>
            <li>With consent, or where required by law.</li>
            <li>To protect our rights, property, or safety.</li>
          </ul>

          <h4>Data Security &amp; Retention</h4>
          <p>
            We implement appropriate technical and organizational measures. We retain personal data only
            as long as necessary for the purposes collected and to meet legal requirements.
          </p>

          <h4>Your Rights</h4>
          <ul>
            <li>Access, rectification, erasure, restriction, objection, portability.</li>
            <li>We aim to respond within one month of receiving a valid request.</li>
          </ul>

          <h4>Changes to This Notice</h4>
          <p>We may update this notice from time to time and will post the latest version on this page.</p>

          <h4>Contact</h4>
          <p>
            <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a><br />
            14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE
          </p>

          <hr />

          <h3>Cookie Policy</h3>
          <p className="mt-0"><em>Last Updated: May 2024</em></p>

          <h4>What Are Cookies?</h4>
          <p>
            Cookies are small text files stored on your device. They help websites function, improve
            performance, and provide analytics for site owners.
          </p>

          <h4>Types of Cookies We Use</h4>
          <ul>
            <li><strong>Essential</strong> — Required for core functionality (e.g., login, preferences).</li>
            <li><strong>Analytical/Performance</strong> — Understand traffic and navigation to improve the Site.</li>
            <li><strong>Functionality</strong> — Remember preferences (e.g., language, region).</li>
            <li><strong>Targeting</strong> — Record pages visited/links followed; may be shared with third parties.</li>
          </ul>

          <h4>Third-Party Cookies</h4>
          <p>
            We may use third-party cookies for analytics, ads, and performance. These are governed by the
            providers’ own privacy policies.
          </p>

          <h4>How We Use Cookies</h4>
          <ul>
            <li>Remember preferences and help process logins/transactions.</li>
            <li>Measure traffic and interactions for better tools and experiences.</li>
            <li>Track campaigns and search engine performance.</li>
          </ul>

          <h4>Your Choices</h4>
          <p>
            You can manage cookies in your browser settings (allow, block, or delete). Blocking all cookies
            may impact essential Site functions.
          </p>

          <h4>Changes to the Cookie Policy</h4>
          <p>We may update this Cookie Policy; please review it periodically for changes.</p>

          <h4>Contact</h4>
          <p>
            <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">educatemedicalllp@gmail.com</a><br />
            14 Titania Close, Bingley, West Yorkshire, United Kingdom, BD16 1WE
          </p>
        </article>
      </LegalModal>

      {/* CONTACT MODAL (unchanged visual, consistent style) */}
      <LegalModal open={modal === "contact"} title="Contact Us" onClose={() => setModal(null)}>
        <div className="prose prose-sm max-w-none">
          <p>We’d love to hear from you. Reach out via any of the channels below.</p>

          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a className="text-blue-600 underline" href="mailto:educatemedicalllp@gmail.com">
              educatemedicalllp@gmail.com
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <a className="text-blue-600 underline" href="tel:+447958913329">
              07958913329
            </a>
          </p>
          <p className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <a
              className="text-blue-600 underline"
              href="https://wa.me/447958913329"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp us
            </a>
          </p>

          <p>
            <a
              className="inline-flex items-center gap-2 text-blue-600 underline"
              href="https://chat.whatsapp.com/IlVXTYgZIxCCOKMV9jtQjY"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Join our WhatsApp group
            </a>
          </p>

          <p className="text-xs text-gray-500">We aim to respond within 72 hours.</p>
        </div>
      </LegalModal>
    </footer>
  );
}