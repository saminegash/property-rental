import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import { getDictionary, hasLocale } from "../dictionaries";
import type { Locale } from "../dictionaries";
import { notFound } from "next/navigation";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar dict={dict.announcement} />
      <Header lang={lang} dict={dict.common} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
