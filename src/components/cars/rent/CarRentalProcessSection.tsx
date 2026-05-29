const STEPS = [
  { n: 1, title: "SEARCH", desc: "Find your ideal car & dates" },
  { n: 2, title: "REQUEST", desc: "Submit a booking request" },
  { n: 3, title: "ADMIN CONFIRMS", desc: "Admin verifies availability with seller" },
  { n: 4, title: "PICKUP", desc: "Inspect the car at agreed location" },
  { n: 5, title: "DRIVE SAFELY", desc: "Complete the trip and return on time" },
] as const;

export default function CarRentalProcessSection() {
  return (
    <section className="bg-white py-10 lg:py-14" id="car-rental-process">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {STEPS.map((step) => (
              <li key={step.n} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-base font-bold text-emerald-600 ring-1 ring-emerald-100">
                  {step.n}
                </div>
                <div className="min-w-0 leading-tight">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 sm:text-sm">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
