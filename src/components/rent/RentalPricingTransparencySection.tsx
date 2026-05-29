import { Calendar, Shield, Headphones, Percent } from "lucide-react";

const ITEMS = [
  {
    icon: Calendar,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Monthly Rent",
    description: "Transparent rate set by the owner — no markups.",
  },
  {
    icon: Shield,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Security Deposit",
    description: "Refundable deposit. Returned at end of lease.",
  },
  {
    icon: Headphones,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Admin Support",
    description: "Optional small service fee included where applicable.",
  },
  {
    icon: Percent,
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    title: "5% MyEthioProperties Commission",
    description: "Only after a successful, completed agreement.",
    highlight: true,
  },
] as const;

export default function RentalPricingTransparencySection() {
  return (
    <section className="bg-slate-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rental Pricing Transparency
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Know exactly what makes up your monthly cost. No hidden fees.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className={`flex flex-col items-start rounded-xl border p-5 transition-shadow hover:shadow-md ${
                item.highlight
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  item.highlight ? "bg-white/15 backdrop-blur" : item.iconBg
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${item.highlight ? "text-white" : item.iconColor}`}
                  aria-hidden="true"
                />
              </div>
              <h3 className={`mt-3 text-base font-semibold ${item.highlight ? "text-white" : "text-slate-900"}`}>
                {item.title}
              </h3>
              <p className={`mt-1.5 text-sm ${item.highlight ? "text-white/90" : "text-slate-600"}`}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust strip below */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Shield className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>Transparent pricing — only after successful agreements.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Percent className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span>Transparent model — no hidden price increases.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
