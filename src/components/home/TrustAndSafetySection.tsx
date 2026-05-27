import { UserCheck, Car, ClipboardCheck, Ban, Percent } from "lucide-react";

const ITEMS = [
  {
    icon: UserCheck,
    title: "Verified Owners",
    description: "Real owners only. We verify identities.",
  },
  {
    icon: Car,
    title: "Verified Sellers",
    description: "Trusted car sellers. Verified documents.",
  },
  {
    icon: ClipboardCheck,
    title: "Admin Reviewed",
    description: "Every listing and request is reviewed.",
  },
  {
    icon: Ban,
    title: "No Upfront Payment",
    description: "No hidden charges or upfront fees.",
  },
  {
    icon: Percent,
    title: "5% Commission",
    description: "Only after successful deal is completed.",
  },
] as const;

export default function TrustAndSafetySection() {
  return (
    <section className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Trust & Safety You Can Rely On
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:mt-8 lg:grid-cols-5">
          {ITEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 shadow-sm ring-2 ring-blue-100">
                <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-[200px]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
