const values = [
    { title: "Quality Education", desc: "Meticulously curated courses taught by industry experts for excellence.", icon: "🎓" },
    { title: "Accessibility", desc: "World-class education accessible to all, anytime, anywhere.", icon: "🌍" },
    { title: "Flexibility", desc: "Study on your schedule — day, night, or weekends.", icon: "🕘" },
    { title: "Affordability", desc: "Competitive pricing with discounts and financial assistance.", icon: "💷" },
  ];
  
  export default function ValueGrid() {
    return (
      <section className="container-app grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <article key={v.title} className="rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_20px_rgba(0,0,0,.05)]">
            <div className="text-2xl">{v.icon}</div>
            <h3 className="mt-2 font-semibold">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
          </article>
        ))}
      </section>
    );
  }
  