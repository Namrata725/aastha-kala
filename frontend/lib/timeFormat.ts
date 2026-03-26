/**
 * Converts a 24-hour time string (HH:MM or HH:MM:SS) to 12-hour format (e.g. "9:00 AM")
 */
export function to12h(time: string | null | undefined): string {
  if (!time) return "—";
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  if (isNaN(hour)) return time;
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${minute} ${ampm}`;
}
