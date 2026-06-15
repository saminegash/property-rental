import { redirect } from "next/navigation";

/**
 * /admin/inquiries now redirects to /admin/requests.
 * The new schema unifies all request types (rental, purchase, viewing, info)
 * into a single `requests` table with a `request_type` column.
 */
export default async function AdminInquiriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/admin/requests`);
}
