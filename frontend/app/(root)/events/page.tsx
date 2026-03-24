import ClientEvents from "@/components/client/ClientEvents";
import ClientGallery from "@/components/client/ClientGallery";
import Heading from "@/components/global/Heading";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Setting = {
  banner?: string;
};

type Category = {
  id: number;
  name: string;
};

type GalleryItem = {
  id: number;
  title: string;
  type: "images" | "video";
  category_id: number;
  images?: string[];
  video?: string;
};

const fetchSettings = async (): Promise<Setting | null> => {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch settings");

    const data = await res.json();
    return data?.data?.setting || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchEvents = async (): Promise<GalleryItem[]> => {
  try {
    const res = await fetch(`${API_URL}/events`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch events");

    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const EventsPage = async () => {
  const settings = await fetchSettings();
  const events = await fetchEvents();

  return (
    <section>
      <Heading
        title="Events"
        image={settings?.banner || "/banner.png"}
        subtitle="Moments and memories"
      />

      <ClientEvents />
    </section>
  );
};

export default EventsPage;
