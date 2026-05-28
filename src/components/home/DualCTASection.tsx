import Link from "next/link";
import Image from "next/image";
import { Home, Car, ArrowRight } from "lucide-react";

export default function DualCTASection() {
  return (
    <section className="bg-white py-10 lg:py-12">
      <div className="mx-auto px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {/* Property CTA */}
          <CtaCard
            tone="blue"
            icon={<Home className="h-5 w-5" />}
            title="Own a property? List it safely"
            subtitle="Reach genuine tenants and buyers. We review requests and connect you only with serious, verified people."
            buttonLabel="List Your Property"
            buttonHref="/dashboard/become-owner"
            image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&h=450&q=80"
            imageAlt="Property listing illustration"
          />

          {/* Car CTA */}
          <CtaCard
            tone="emerald"
            icon={<Car className="h-5 w-5" />}
            title="Want to sell your car?"
            subtitle="Get your car in front of thousands of serious buyers. We verify and support you every step."
            buttonLabel="Sell Your Car"
            buttonHref="/dashboard/become-owner?category=car"
            image="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&h=450&q=80"
            imageAlt="Car selling illustration"
          />
        </div>
      </div>
    </section>
  );
}

function CtaCard({
  tone,
  icon,
  title,
  subtitle,
  buttonLabel,
  buttonHref,
  image,
  imageAlt,
}: {
  tone: "blue" | "emerald";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  image: string;
  imageAlt: string;
}) {
  const bg = tone === "blue" ? "bg-blue-600" : "bg-emerald-600";
  const btn = tone === "blue"
    ? "bg-white text-blue-600 hover:bg-blue-50"
    : "bg-white text-emerald-600 hover:bg-emerald-50";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${bg} text-white`}>
      <div className="relative grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] items-center gap-4 p-5 sm:p-6 lg:p-7">
        {/* Text */}
        <div>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            {icon}
          </div>
          <h3 className="mt-3 text-lg font-bold leading-snug sm:text-xl lg:text-2xl">
            {title}
          </h3>
          <p className="mt-2 text-sm text-white/90 sm:text-[15px]">
            {subtitle}
          </p>
          <Link
            href={buttonHref}
            className={`mt-5 inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all ${btn}`}
          >
            {icon}
            {buttonLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Image — inset from card corners */}
        <div className="pb-2 pr-2 sm:pb-3 sm:pr-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/10 sm:aspect-square">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
