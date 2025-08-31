export default function StatsStrip() {
    const items = [
      { k: "Learners", v: "10k+" },
      { k: "Lessons", v: "150+" },
      { k: "Countries", v: "30+" },
    ];
    return (
      <section className="container-app grid grid-cols-3 gap-4 text-center">
        {items.map((it) => (
          <div key={it.k} className="rounded-xl border bg-white p-4">
            <div className="text-2xl font-bold">{it.v}</div>
            <div className="text-sm text-muted-foreground">{it.k}</div>
          </div>
        ))}
      </section>
    );
  }
  