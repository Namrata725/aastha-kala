import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: AdminLayoutProps) {

  return (
    <div>
      <Navbar />

      <main className="public-content">{children}</main>
      <Footer />
    </div>
  );
}
