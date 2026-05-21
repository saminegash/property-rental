import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function MarketplaceHeroSection() {
  const supabase = await createClient();

  // Count published listings by category
  const { count: carCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("category", "vehicle")
    .eq("status", "published");

  const { count: propertyCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("category", "property")
    .eq("status", "published");

  return (
    <section className="marketplace-hero" id="marketplace-hero">
      <div className="marketplace-hero__inner">
        <h1 className="marketplace-hero__headline">
          Rent &amp; buy with{" "}
          <span className="marketplace-hero__highlight">trust</span>
        </h1>
        <p className="marketplace-hero__subtext">
          Ethiopia&apos;s verified marketplace for cars and properties.
          Transparent pricing, admin-reviewed listings, and secure transactions.
        </p>

        {/* Category Tabs */}
        <div className="marketplace-hero__tabs">
          <Link href="/cars" className="marketplace-hero__tab" id="hero-tab-cars">
            🚗 Browse Cars
          </Link>
          <Link href="/properties" className="marketplace-hero__tab" id="hero-tab-properties">
            🏠 Browse Properties
          </Link>
        </div>

        {/* Platform Stats */}
        <div className="marketplace-hero__stats">
          <div className="marketplace-hero__stat">
            <div className="marketplace-hero__stat-value">{carCount || 0}</div>
            <div className="marketplace-hero__stat-label">Cars Listed</div>
          </div>
          <div className="marketplace-hero__stat">
            <div className="marketplace-hero__stat-value">{propertyCount || 0}</div>
            <div className="marketplace-hero__stat-label">Properties Listed</div>
          </div>
          <div className="marketplace-hero__stat">
            <div className="marketplace-hero__stat-value">5%</div>
            <div className="marketplace-hero__stat-label">Commission Only</div>
          </div>
        </div>
      </div>
    </section>
  );
}
