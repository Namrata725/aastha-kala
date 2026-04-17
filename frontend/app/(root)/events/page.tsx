export const dynamic = "force-dynamic";
import ClientEvents from "@/components/client/ClientEvents";
import Heading from "@/components/global/Heading";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Setting = {
  banner?: string;
};

type EventItem = {
  id: number;
  title: string;
  description: string;
  slug: string;
  banner?: string | null;
  event_date: string;
  location: string;
  status: string;
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

const fetchEvents = async (): Promise<EventItem[]> => {
  try {
    const res = await fetch(`${API_URL}/events`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch events");

    const json = await res.json();
    const events = json?.data?.data || json?.data;

    if (!Array.isArray(events)) return [];

    return events.filter((event: EventItem) => event.status === "published");
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default async function EventsPage() {
  const settings = await fetchSettings();
  const events = await fetchEvents();

  return (
    <section>
      <Heading className="text-[#27A0CF]"
        title="Events & Performances"
        subtitle={
          <span className="text-black">
            Experience exciting moments and step into the rhythm of expression.
          </span>
        }
      />

      <ClientEvents events={events} />
    </section>
  );
}
