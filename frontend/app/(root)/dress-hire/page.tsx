export const dynamic = "force-dynamic";
import ClientDressHire from "@/components/client/ClientDressHire";
import Heading from "@/components/global/Heading";
import { Shirt } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Setting = {
  banner?: string;
};

type DressHireItem = {
  id: number;
  title: string;
  phone:string;
  images: string[];
};

async function getSettings(): Promise<Setting | null> {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.data?.setting || null;
  } catch {
    return null;
  }
}

async function getDressHire(): Promise<DressHireItem[]> {
  try {
    const res = await fetch(`${API_URL}/dress-hire`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const dressHire = json?.data?.data || json?.data;

    return Array.isArray(dressHire) ? dressHire : [];
  } catch {
    return [];
  }
}

export default async function DressHirePage() {
  const [settings, dresses] = await Promise.all([
    getSettings(),
    getDressHire(),
  ]);

  return (
    <section className="">
      <Heading 
        title="Dress Hire"
        subtitle="Explore our exclusive collection of traditional and performance attire available for rent."
      />

      {dresses.length > 0 ? (
        <ClientDressHire dresses={dresses} />
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
          <Shirt className="w-12 h-12 animate-infinite-bounce" />
          <p className="mt-3 text-sm">No images or videos in this category</p>
        </div>
      )}
    </section>
  );
}
