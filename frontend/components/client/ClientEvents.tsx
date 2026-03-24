"use client";

import EventCard from "../layout/EventsCard";

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

const ClientEvents = ({ events = [] }: { events?: EventItem[] }) => {
  console.log("CLIENT EVENTS:", events);

  return (
    <div className="grid max-w-7xl mx-auto md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default ClientEvents;
