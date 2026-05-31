import { ListingsGrid } from "@/components/listings/ListingsGrid";

/**
 * Home-page featured strip. Renders all property types mixed,
 * featured items first, latest after. Behavior is unchanged —
 * the data & rendering now live in `ListingsGrid`.
 */
export async function FeaturedListingsSection() {
  return (
    <ListingsGrid
      title="Featured Listings"
      subtitle="Hand-picked properties and vehicles from verified owners."
      viewAllHref="/trade"
      background="slate"
      limit={30}
    />
  );
}
