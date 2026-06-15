import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
