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

const fetchGallery = async (): Promise<GalleryItem[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/gallery`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch gallery");

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_URL}/gallery-categories`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const GalleryPage = async () => {
  const settings = await fetchSettings();
  const gallery = await fetchGallery();
  const categories = await fetchCategories();

  return (
    <section>
      <Heading
        title="Gallery and Videos"
        image={settings?.banner || "/banner.png"}
        subtitle="Moments and memories"
      />

      <ClientGallery gallery={gallery} categories={categories} />
    </section>
  );
};

export default GalleryPage;
