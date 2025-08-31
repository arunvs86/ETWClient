import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const testimonials = [
  { name: "Aisha", quote: "Clear, structured lessons. Landed an internship in 6 weeks." },
  { name: "Tom", quote: "The membership paid for itself with one course. Loved the projects." },
  { name: "Mei", quote: "Great pacing and the community is super helpful." },
];

export default function TestimonialSlider() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[idx];

  return (
    <section className="container-app text-center">
      <h2 className="text-3xl md:text-4xl font-bold">What learners say</h2>
      <div className="mt-6 relative mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border bg-white p-8"
          >
            <p className="text-lg">“{t.quote}”</p>
            <div className="mt-3 text-sm text-muted-foreground">— {t.name}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
