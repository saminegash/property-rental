import { ListingsGrid } from "@/components/listings/ListingsGrid";

interface FeaturedDict {
  title: string;
  subtitle: string;
  viewAll: string;
  emptyTitle: string;
  emptyDesc: string;
  postListing: string;
  browseMarketplace: string;
}

/**
 * Home-page featured strip. Renders all property types mixed,
 * featured items first, latest after. Behavior is unchanged —
 * the data & rendering now live in `ListingsGrid`.
 */
export async function FeaturedListingsSection({
  dict,
  lang,
}: {
  dict: FeaturedDict;
  lang: string;
}) {
  return (
    <ListingsGrid
      title={dict.title}
      subtitle={dict.subtitle}
      viewAllHref={`/${lang}/trade`}
      viewAllLabel={dict.viewAll}
      emptyTitle={dict.emptyTitle}
      emptyDesc={dict.emptyDesc}
      emptyPrimaryLabel={dict.postListing}
      emptySecondaryLabel={dict.browseMarketplace}
      background="slate"
      limit={30}
      lang={lang}
    />
  );
}
