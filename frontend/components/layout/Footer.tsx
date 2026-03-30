import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { ensureAbsoluteUrl } from "@/utils/url";

// Fetch settings with caching (1 hour)
const getSettings = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data?.data || { setting: null, social_links: null };
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return { setting: null, social_links: null };
  }
};

const Footer = async () => {
  const data = await getSettings();
  const setting = data?.setting;
  const socialLinks = data?.social_links;

  const socials = [
    {
      id: "facebook",
      icon: <Facebook className="w-5 h-5" />,
      url: ensureAbsoluteUrl(socialLinks?.facebook),
      className:
        "bg-[#1877F2] text-white border-transparent hover:shadow-[0_8px_20px_-8px_#1877F2]",
    },
    {
      id: "instagram",
      icon: <Instagram className="w-5 h-5" />,
      url: ensureAbsoluteUrl(socialLinks?.instagram),
      className:
        "bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white border-transparent hover:shadow-[0_8px_20px_-8px_#ee2a7b]",
    },
    {
      id: "tiktok",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.45-.1.74-.12 1.49-.12 2.24 0 2.44-.68 4.96-2.52 6.58-1.89 1.74-4.7 2.22-7.09 1.58-2.6-.74-4.56-2.99-4.99-5.61-.56-3.23 1.25-6.66 4.28-7.82.52-.2 1.07-.33 1.62-.41V9.58c-1.54.21-2.91 1.23-3.4 2.73-.65 1.83.1 4.09 1.83 5 1.73.95 4.15.54 5.39-1.04.53-.66.82-1.49.82-2.33V0h.01Z" />
        </svg>
      ),
      url: ensureAbsoluteUrl(socialLinks?.tiktok),
      className:
        "bg-black text-white border-transparent hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",
    },
    {
      id: "x",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404Z" />
        </svg>
      ),
      url: ensureAbsoluteUrl(socialLinks?.x),
      className:
        "bg-[#0f1419] text-white border-transparent hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",
    },
    {
      id: "youtube",
      icon: <Youtube className="w-5 h-5" />,
      url: ensureAbsoluteUrl(socialLinks?.youtube),
      className:
        "bg-[#FF0000] text-white border-transparent hover:shadow-[0_8px_20px_-8px_#FF0000]",
    },
  ].filter((social) => social.url);

  return (
    <footer className="bg-white border-t border-blue-100 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <img
                src={setting?.logo || "/logo.jpg"}
                alt={setting?.company_name || "Aastha Kala Kendra"}
                className="h-10 w-10"
              />
              <h2 className="text-xl font-semibold text-blue-600">
                {setting?.company_name || "Aastha Kala Kendra"}
              </h2>
            </Link>

            <p className="mt-4 text-gray-600 text-sm">
              {setting?.about_short ||
                "Empowering artists and nurturing talent since 1999. Join our vibrant community and discover your creative potential."}
            </p>

            {/* Social Icons */}
            {socials.length > 0 && (
              <div className="mt-4 flex gap-3">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full flex items-center justify-center ${social.className}`}
                    title={`Follow us on ${social.id}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="hover:text-blue-600">
                  Instructors
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-blue-600">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-blue-600">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Program
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              {/* Add program items here */}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Contact Details
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>{setting?.phone || "+977 9841305158"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>{setting?.email || "aasthakalakendra@gmail.com"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>
                  {setting?.address || "Narayangopal Chowk, Kathmandu, Nepal"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t-4 mt-10 pt-6 text-center text-sm text-blue-600">
          © {new Date().getFullYear()}{" "}
          {setting?.company_name || "Aastha Kala Kendra"}, All rights reserved.
          | Designed & Developed by{" "}
          <Link
            href="https://shaktatechnology.com/"
            target="_blank"
            className="font-bold hover:underline"
          >
            Shakta Technology
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
