import { Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

// Fetch settings with caching (1 hour)
const getSettings = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    const data = await res.json();
    return data?.data?.setting || null;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
};

//  Fetch latest programs with caching
const getLatestPrograms = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/programs/latest`,
      {
        next: { revalidate: 3600 },
      }
    );

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    return [];
  }
};

//  Server Component 
const Footer = async () => {
  const [setting, latestPrograms] = await Promise.all([
    getSettings(),
    getLatestPrograms(),
  ]);

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
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="/instructors" className="hover:text-blue-600">Instructors</Link></li>
              <li><Link href="/events" className="hover:text-blue-600">Events</Link></li>
              <li><Link href="/gallery" className="hover:text-blue-600">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Program
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              {latestPrograms.length > 0 ? (
                latestPrograms.map((program: any) => (
                  <li key={program.id}>
                    <Link href="/programs" className="hover:text-blue-600">
                      {program.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>Vocal Training</li>
                  <li>Instrumental Music</li>
                  <li>Dance</li>
                  <li>Acting</li>
                  <li>Performing Arts</li>
                </>
              )}
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
                  {setting?.address ||
                    "Narayangopal Chowk, Kathmandu, Nepal"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t-4 mt-10 pt-6 text-center text-sm text-blue-600">
          © {new Date().getFullYear()}{" "}
          {setting?.company_name || "Aastha Kala Kendra"}, All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;