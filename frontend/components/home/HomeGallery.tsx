import ClientGallery from "@/components/client/ClientGallery";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* -------------------- TYPES -------------------- */

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

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  x?: string;
}

interface SettingResponse {
  data: {
    setting: any;
    social_links: SocialLinks;
  };
}

/* -------------------- FETCH FUNCTIONS -------------------- */

const fetchGallery = async (): Promise<GalleryItem[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/gallery`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch gallery");

    const data = await res.json();
    return data || [];
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
    return data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchSettings = async (): Promise<SocialLinks | null> => {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch settings");

    const json: SettingResponse = await res.json();

    return json?.data?.social_links || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/* -------------------- UTILS -------------------- */

const formatUrl = (url?: string) =>
  url?.startsWith("http") ? url : `https://${url}`;

/* -------------------- COMPONENT -------------------- */

const HomeGallery = async ({ socialLinks }: { socialLinks: SocialLinks | null }) => {
  const gallery = await fetchGallery();
  const categories = await fetchCategories();

  if (gallery.length === 0) return null;

  const limitedGallery = gallery.slice(0, 8);

  return (
    <section className="max-w-6xl mx-auto my-6">
      {/* HEADER */}
      <div className="text-center my-5">
        <h1 className="text-3xl font-bold text-primary tracking-wide font-poppins m-2">
          Gallery and Videos
        </h1>
        <p className="font-semibold text-secondary tracking-wider">
          <span>Moments and memories</span>
        </p>
      </div>

      {/* GALLERY */}
      <ClientGallery gallery={limitedGallery} categories={categories} />

      {/* SOCIAL LINKS */}
      {socialLinks && (
        <div className="flex justify-center gap-4 mt-8">
          {socialLinks.facebook && (
            <a
              href={formatUrl(socialLinks.facebook)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="p-1.5 w-9 h-9 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition" />
            </a>
          )}

          {socialLinks.instagram && (
            <a
              href={formatUrl(socialLinks.instagram)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="p-1.5 w-9 h-9 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition" />
            </a>
          )}

          {socialLinks.x && (
            <a
              href={formatUrl(socialLinks.x)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="p-1.5 w-9 h-9 rounded-full bg-gray-200 text-blue-500 hover:bg-gray-300 transition" />
            </a>
          )}
        </div>
      )}
    </section>
  );
};

export default HomeGallery;
