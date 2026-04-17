export const dynamic = "force-dynamic";
import ClientInstructors from "@/components/client/ClientInstructors";
import Heading from "@/components/global/Heading";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchSettings = async () => {
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

const fetchInstructors = async () => {
  try {
    const res = await fetch(`${API_URL}/instructors`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch instructors");

    const data = await res.json();

    console.log("INSTRUCTORS RESPONSE:", data);

    return data?.data?.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const InstructorPage = async () => {
  const settings = await fetchSettings();
  const instructors = await fetchInstructors();

  return (
    <section>
      <Heading className="text-[#27A0CF]"
        title="Our Instructors"
        subtitle={
          <span className="text-black">
            Learn from industry professionals and award-winning artists dedicated to your success.
          </span>
        }
      />

      <ClientInstructors instructors={instructors} />
    </section>
  );
};

export default InstructorPage;
