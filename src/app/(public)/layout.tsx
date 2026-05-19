import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mp-page">
      <Header />
      <main className="mp-main">{children}</main>
      <Footer />
    </div>
  );
}
