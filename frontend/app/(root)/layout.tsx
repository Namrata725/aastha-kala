import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventOverlay from "@/components/layout/EventOverlay";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: AdminLayoutProps) {

  return (
    <div>
      <EventOverlay />
      <Navbar />

      <main className="public-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
