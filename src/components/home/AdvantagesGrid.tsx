const advantages = [
    { title: "Comprehensive Curriculum", desc: "Covers essential topics for a well-rounded education." },
    { title: "Interactive Learning", desc: "Engaging multimedia content enhances understanding." },
    { title: "Flexible Schedule", desc: "Study at your own pace and convenience." },
    { title: "Lifetime Access", desc: "Continue learning with unlimited access to resources." },
  ];
  
  export default function AdvantagesGrid() {
    return (
      <section className="container-app">
        <header className="text-center space-y-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">The Advantages of the EDUCATE Program</h2>
          <p className="text-muted-foreground">Designed for outcomes, built for real life.</p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((a) => (
            <article key={a.title} className="rounded-2xl border bg-white p-6">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }
  