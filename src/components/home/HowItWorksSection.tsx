const STEPS = [
  {
    n: 1,
    title: "Search or Browse",
    desc: "Find properties or cars that match your needs",
  },
  {
    n: 2,
    title: "Send Inquiry",
    desc: "Send a request or inquiry to the owner",
  },
  {
    n: 3,
    title: "Admin Reviews",
    desc: "We review and verify the request & listing",
  },
  {
    n: 4,
    title: "Owner/Seller Contacted",
    desc: "If verified, owner or seller will contact you",
  },
  {
    n: 5,
    title: "Visit & Complete Safely",
    desc: "Visit, inspect, and complete the deal safely",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section className="bg-slate-50 py-12 lg:py-16" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Safe, simple, and transparent — from search to handover.
          </p>
        </div>

        {/* Steps with dashed connectors */}
        <ol className="mt-8 lg:mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2 relative">
          {STEPS.map((step, idx) => (
            <li key={step.n} className="relative flex flex-col items-center text-center">
              {/* Dashed connector to next step (desktop only) */}
              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden lg:block absolute left-[calc(50%+2rem)] right-[calc(-50%+2rem)] top-6 h-px border-t-2 border-dashed border-blue-300"
                />
              )}

              {/* Numbered circle */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white shadow-md ring-4 ring-blue-50">
                {step.n}
              </div>

              <h3 className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">
                {step.title}
              </h3>
              <p className="mt-1 text-xs text-slate-600 max-w-[200px] sm:text-sm">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
