export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import ClientProgramDetail from "@/components/client/ClientProgramDetail";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
}

/** Slug format: "program-title-slug-{id}" — ID is the last segment after the last "-" */
const extractIdFromSlug = (slug: string): string | null => {
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  return /^\d+$/.test(id) ? id : null;
};

const fetchProgram = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/programs/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Fetch Program Error:", error);
    return null;
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  if (!id) return { title: "Program Not Found" };
  const program = await fetchProgram(id);
  return {
    title: program ? `${program.title} | Aastha Kala Kendra` : "Program | Aastha Kala Kendra",
    description: program?.description || "Explore this program at Aastha Kala Kendra.",
  };
}

const ProgramDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);

  if (!id) notFound();

  const program = await fetchProgram(id!);
  if (!program) notFound();

  return <ClientProgramDetail program={program} />;
};

export default ProgramDetailPage;
