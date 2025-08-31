import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t bg-white" role="contentinfo">
      <nav aria-label="Footer" className="container-app py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Company</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/about" className="hover:underline">About</Link></li>
              <li><Link to="/courses" className="hover:underline">Courses</Link></li>
              <li><Link to="/events" className="hover:underline">Events</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For Students</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/login" className="hover:underline">Student Login</Link></li>
              <li><Link to="/courses?category=medicine" className="hover:underline">Career in Medicine</Link></li>
              <li><Link to="/rules" className="hover:underline">Rules &amp; Requirements</Link></li>
            </ul>
          </div>

          {/* For Tutors */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For Tutors</h3>
            <ul className="mt-3 space-y-2">
              {/* Redirect straight to existing instructor area */}
              <li><Link to="/teach" className="hover:underline">Tutors Login</Link></li>
            </ul>
          </div>

          {/* Connect with us */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Connect with us</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a className="hover:underline" href="https://wa.me/447958913329" target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
              <li>
                <a className="hover:underline" href="tel:+447958913329">07958913329</a>
              </li>
              <li className="pt-2">
                <div className="text-sm font-semibold">Email</div>
                <a className="hover:underline" href="mailto:educatemedicalllp@gmail.com">
                  educatemedicalllp@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="border-t">
        <div className="container-app py-4 text-sm text-muted-foreground flex items-center justify-between">
          <span>© {year} Educate The World</span>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
