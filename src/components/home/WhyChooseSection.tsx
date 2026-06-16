import { Users, ShieldCheck, GraduationCap, Smartphone } from "lucide-react";

interface WhyChooseDict {
  title: string;
  trustedTitle: string;
  trustedDesc: string;
  adminTitle: string;
  adminDesc: string;
  allInOneTitle: string;
  allInOneDesc: string;
  mobileTitle: string;
  mobileDesc: string;
}

export default function WhyChooseSection({ dict }: { dict: WhyChooseDict }) {
  const FEATURES = [
    {
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      title: dict.trustedTitle,
      description: dict.trustedDesc,
    },
    {
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      title: dict.adminTitle,
      description: dict.adminDesc,
    },
    {
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50",
      title: dict.allInOneTitle,
      description: dict.allInOneDesc,
    },
    {
      icon: Smartphone,
      color: "text-orange-600",
      bg: "bg-orange-50",
      title: dict.mobileTitle,
      description: dict.mobileDesc,
    },
  ];

  return (
    <section className="bg-slate-50 py-12 lg:py-16">
      <div className="mx-auto px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {dict.title}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, color, bg, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
