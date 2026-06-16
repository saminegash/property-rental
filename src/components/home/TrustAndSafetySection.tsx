import { UserCheck, Car, ClipboardCheck, Ban, Percent } from "lucide-react";

interface TrustSafetyDict {
  title: string;
  verifiedOwners: string;
  verifiedOwnersDesc: string;
  verifiedSellers: string;
  verifiedSellersDesc: string;
  adminReviewed: string;
  adminReviewedDesc: string;
  noUpfront: string;
  noUpfrontDesc: string;
  lowCommission: string;
  lowCommissionDesc: string;
}

export default function TrustAndSafetySection({
  dict,
}: {
  dict: TrustSafetyDict;
}) {
  const ITEMS = [
    {
      icon: UserCheck,
      title: dict.verifiedOwners,
      description: dict.verifiedOwnersDesc,
    },
    {
      icon: Car,
      title: dict.verifiedSellers,
      description: dict.verifiedSellersDesc,
    },
    {
      icon: ClipboardCheck,
      title: dict.adminReviewed,
      description: dict.adminReviewedDesc,
    },
    {
      icon: Ban,
      title: dict.noUpfront,
      description: dict.noUpfrontDesc,
    },
    {
      icon: Percent,
      title: dict.lowCommission,
      description: dict.lowCommissionDesc,
    },
  ];

  return (
    <section className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto px-4 sm:px-6">
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {dict.title}
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
