export const dynamic = "force-dynamic";
import Heading from "@/components/global/Heading";
import ClientPrograms from "@/components/client/ClientPrograms";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch settings");
    const data = await res.json();
    return data?.data?.setting || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchPrograms = async () => {
  try {
    const res = await fetch(`${API_URL}/programs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch programs");
    const data = await res.json();
    return data?.data?.data || data?.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const metadata = {
  title: "Our Programs | Aastha Kala Kendra",
  description:
    "Explore our performing arts programs including vocal training, dance, instrumental music, and acting. Book your class online or in person.",
};

const ProgramsPage = async () => {
  const [settings, programs] = await Promise.all([
    fetchSettings(),
    fetchPrograms(),
  ]);

  return (
    <section>
      <Heading
        title="Our Programs"
        image={settings?.banner || "/banner.png"}
        subtitle={
          <>
            At Aasha Kala Kendra, our programs are designed to nurture talent,
            build confidence, and develop artistic excellence. 
            Whether your <br /> passion lies in music, dance, acting, or complete stage
            performance, our structured training helps you grow step by step.
          </>
        }
      />

      <ClientPrograms programs={programs} />
    </section>
  );
};

export default ProgramsPage;
