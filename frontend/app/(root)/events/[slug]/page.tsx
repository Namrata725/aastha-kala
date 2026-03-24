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
  if (!path) return "/banner.png";
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
      <div className="overflow-hidden shadow-md">
        <img
          src={getImageUrl(event.banner)}
          alt={event.title}
          className="w-full h-85 md:h-90 2xl:h-120 object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-[70%] space-y-8">
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

            <div className="text-secondary leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-[30%] space-y-6">
            {/* Contact */}
            <div className="p-4 border rounded-xl bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Contact Information
              </h3>

              <div className="flex items-center gap-3 text-secondary">
                <User className="w-5 h-5" />
                <span>{event.contact_person_name || "N/A"}</span>
              </div>

              <div className="flex items-center gap-3 text-secondary mt-2">
                <Phone className="w-5 h-5" />
                <span>{event.contact_person_phone || "N/A"}</span>
              </div>
            </div>

            {/* Blogs */}
            <div className="p-4 border rounded-xl bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Recent Blogs
              </h3>

              <ul className="space-y-3 text-secondary">
                {recentBlogs.map((blog, index) => (
                  <li key={index} className="hover:text-primary cursor-pointer">
                    {blog}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
