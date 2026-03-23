import ContactForm from "@/components/client/ContactForm";
import Heading from "@/components/global/Heading";
import { Mail, Phone, MapPin, Facebook, Instagram, Music2, Twitter } from "lucide-react";
import { ensureAbsoluteUrl } from "@/utils/url";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch settings");

    const data = await res.json();
    return data?.data || { setting: null, social_links: null };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getMapEmbedUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("google.com/maps/embed")) return url;

  // Extract place name or coordinates if it's a standard URL
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("google.com") && urlObj.pathname.includes("/maps/place/")) {
      const placeName = urlObj.pathname.split("/maps/place/")[1].split("/")[0];
      return `https://www.google.com/maps?q=${placeName}&output=embed`;
    }
  } catch (e) {
    // If parsing fails, fall back to simple search embed if it looks like a string
  }

  return url;
};

const ContactPage = async () => {
  const data = await fetchSettings();
  const settings = data?.setting;
  const socialLinks = data?.social_links;

  return (
    <section className="bg-white">
      <Heading
        title="Get in Touch"
        image={settings?.banner || "/logo.jpg"}
        subtitle="Ready to start your musical journey? Contact us today for more information or schedule a tour"
      />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-12">

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary p-[6px] rounded-full flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Contact Number
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {settings?.phone || "+977 9841305158"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary p-[6px] rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Email Address
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {settings?.email || "aasthakalakendra1@gmail.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary p-[6px] rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Location
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {settings?.address || "Narayangoal Chowk, Kathmandu, Nepal"}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            {settings?.location_map && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-80 shadow-lg">
                <iframe
                  src={getMapEmbedUrl(settings.location_map)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Send us a Message
            </h2>
            <ContactForm />
          </div>
        </div>

        {/* Social Media Section */}
        {socialLinks && (
          <div className="mt-20 pt-16 border-t border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-blue-600 mb-8 uppercase tracking-widest">
              Follow Us On Social Media!
            </h2>
            <div className="flex justify-center gap-6">
              {socialLinks.facebook && (
                <a
                  href={ensureAbsoluteUrl(socialLinks.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-4 rounded-full text-white hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-lg"
                >
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={ensureAbsoluteUrl(socialLinks.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-600 p-4 rounded-full text-white hover:bg-pink-700 transition transform hover:-translate-y-1 shadow-lg"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={ensureAbsoluteUrl(socialLinks.tiktok)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black p-4 rounded-full text-white hover:bg-gray-900 transition transform hover:-translate-y-1 shadow-lg"
                >
                  <Music2 className="w-6 h-6" />
                </a>
              )}
              {socialLinks.x && (
                <a
                  href={ensureAbsoluteUrl(socialLinks.x)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-4 rounded-full text-white hover:bg-black transition transform hover:-translate-y-1 shadow-lg"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactPage;
