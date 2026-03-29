"use client";

import React, { useEffect, useState } from "react";
import ClientDressHire from "@/components/client/ClientDressHire";
import Heading from "@/components/global/Heading";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Setting = {
  banner?: string;
};

type DressHireItem = {
  id: number;
  title: string;
  images: string[]; // <-- use images array
};

export default function DressHirePage() {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [dresses, setDresses] = useState<DressHireItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch settings");

      const data = await res.json();
      setSettings(data?.data?.setting || null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to fetch settings");
    }
  };

  const fetchDressHire = async () => {
    try {
      const res = await fetch(`${API_URL}/dress-hire`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch dress hire items");

      const json = await res.json();
      const dressHire = json?.data?.data || json?.data;
      if (!Array.isArray(dressHire)) return;

      setDresses(dressHire);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to fetch dresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchDressHire();
  }, []);

  return (
    <section className="max-w-7xl mx-auto p-4">
      <Heading
        title="Dress Hire"
        image={settings?.banner || "/logo.jpg"}
        subtitle="Explore our exclusive dress collection"
      />

      {loading ? (
        <p className="text-center mt-10">Loading dresses...</p>
      ) : dresses.length > 0 ? (
        <ClientDressHire dresses={dresses} />
      ) : (
        <p className="text-center mt-10 text-gray-500">
          No dresses available for hire at the moment.
        </p>
      )}
    </section>
  );
}
