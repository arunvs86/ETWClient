export default function ComingSoon({ title = "Coming soon" }: { title?: string }) {
    return (
      <div className="container-app py-12">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-gray-600 mt-2">We’re building this section. Check back shortly.</p>
      </div>
    );
  }
  