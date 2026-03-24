import ClientInstructors from "@/components/client/ClientInstructors";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchInstructors = async () => {
  try {
    const res = await fetch(`${API_URL}/instructors`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch instructors");

    const data = await res.json();

    return data?.data?.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const HomeInstructor = async () => {
  const instructors = await fetchInstructors();

  if (instructors.length === 0) return null;

  const limitedInstructors = instructors.slice(0, 2);

  const hasMoreThanTwo = instructors.length > 2;

  return (
    <section className=" max-w-6xl mx-auto my-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary tracking-wide font-poppins mb-2">
          Meet Our Instructors
        </h1>
        <p className=" font-semibold text-secondary tracking-wider">
          <span>
            Learn from industry professionals and award-winning artists
            dedicated to your success.
          </span>
        </p>
      </div>
      <ClientInstructors instructors={limitedInstructors} />

      {hasMoreThanTwo && (
        <div className="text-center">
          <Link
            href="/instructors"
            className="px-6 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-lg "
          >
            See More
          </Link>
        </div>
      )}
    </section>
  );
};

export default HomeInstructor;
