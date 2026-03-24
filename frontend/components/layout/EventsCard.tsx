import Link from "next/link";

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

const EventCard = ({ event }: { event: EventItem }) => {
  return (
    <div className="group relative rounded-2xl shadow-md overflow-hidden bg-white">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.banner || "/banner.png"}
          alt={event.title}
          className="w-full h-full object-cover"
        />

        <div
          className="
            absolute bottom-0 left-0 right-0
            h-1/2
            bg-white/95
            p-4
            transform translate-y-full
            group-hover:translate-y-0
            transition-transform duration-300 ease-in-out
            flex flex-col
          "
        >
          <p className="text-sm text-gray-600 line-clamp-5">
            {event.description}
          </p>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold line-clamp-1">{event.title}</h2>

        <div className="mt-3">
          <Link
            href={`/events/${event.slug}`}
            className="block text-center bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
