import { User, Phone, Calendar, MapPin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

type EventItem = {
  id: number;
  title: string;
  description: string;
  slug: string;
  banner?: string | null;
  event_date: string;
  location: string;
  status: string;
  contact_person_name?: string;
  contact_person_phone?: string;
};

const getImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${IMAGE_URL}${path}`;
};

const fetchEventBySlug = async (slug: string): Promise<EventItem | null> => {
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch event");

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ IMPORTANT: await params
  const { slug } = await params;

  const event = await fetchEventBySlug(slug);

  if (!event) {
    return <div className="p-10 text-center">Event not found</div>;
  }

  const recentBlogs = [
    "How to Plan Events",
    "Top 10 Event Tips",
    "Managing Attendees Effectively",
  ];

  return (
    <div>
      {/* Banner */}
      {event.banner && (
        <div className="overflow-hidden shadow-md">
          <img
            src={getImageUrl(event.banner)}
            alt={event.title}
            className="w-full h-85 md:h-90 2xl:h-120 object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-[100%] space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.event_date).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </div>
            <div
              className="text-secondary leading-relaxed text-justify 
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-primary
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-primary
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-primary
                [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: event.description || "" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
