interface HowItWorksDict {
  title: string;
  subtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;
}

export default function HowItWorksSection({ dict }: { dict: HowItWorksDict }) {
  const STEPS = [
    { n: 1, title: dict.step1Title, desc: dict.step1Desc },
    { n: 2, title: dict.step2Title, desc: dict.step2Desc },
    { n: 3, title: dict.step3Title, desc: dict.step3Desc },
    { n: 4, title: dict.step4Title, desc: dict.step4Desc },
    { n: 5, title: dict.step5Title, desc: dict.step5Desc },
  ];

  return (
    <section className="bg-slate-50 py-12 lg:py-16" id="how-it-works">
      <div className="mx-auto px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {dict.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {dict.subtitle}
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
