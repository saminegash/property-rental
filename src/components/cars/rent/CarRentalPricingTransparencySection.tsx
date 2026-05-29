import { Calendar, Shield, UserCheck, Percent } from "lucide-react";

const ITEMS = [
  {
    icon: Calendar,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Daily Rate",
    description: "Transparent daily price set by the car owner — no surprise markups.",
    highlight: false,
  },
  {
    icon: Shield,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Refundable Deposit",
    description: "Refundable security deposit. Returned after safe vehicle return.",
    highlight: false,
  },
  {
    icon: UserCheck,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Driver Fee (Optional)",
    description: "Only if you choose 'With Driver' — quoted upfront, no hidden costs.",
    highlight: false,
  },
  {
    icon: Percent,
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
    title: "5% MyEthioProperties Commission",
    description: "Only charged after a completed, successful rental.",
    highlight: true,
  },
] as const;

export default function CarRentalPricingTransparencySection() {
  return (
    <section className="bg-slate-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rental Pricing Transparency
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Know exactly what you&apos;ll pay before you book. No hidden fees.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className={`flex flex-col items-start rounded-xl border p-5 transition-shadow hover:shadow-md ${
                item.highlight
                  ? "border-emerald-600 bg-emerald-600 text-white"
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
      </div>
    </section>
  );
}
