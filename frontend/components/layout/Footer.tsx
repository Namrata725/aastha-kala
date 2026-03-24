import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  const [setting, setSetting] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        const data = await res.json();

        if (data.success) {
          setSetting(data.data.setting);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-2">
              <img
                src={setting?.logo || "/logo.jpg"}
                alt={setting?.company_name || "Aastha Kala Kendra"}
                className="h-10 w-10"
              />
              <h2 className="text-xl font-semibold text-blue-600">
                {setting?.company_name || "Aastha Kala Kendra"}
              </h2>
            </div>
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
              <li>About Us</li>
              <li>Instructors</li>
              <li>Events</li>
              <li>Gallery</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* Programs (STATIC as requested) */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Program
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>Vocal Training</li>
              <li>Instrumental Music</li>
              <li>Dance</li>
              <li>Acting</li>
              <li>Performing Arts</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Contact Details
            </h3>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <div className="bg-linear-to-r from-primary to-secondary p-1.5 rounded-full flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span>{setting?.phone || "+977 9841305158"}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-linear-to-r from-primary to-secondary p-1.5 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span>{setting?.email || "aasthakalakendra@gmail.com"}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-linear-to-r from-primary to-secondary p-1.5 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span>
                  {setting?.address || "Narayangopal Chowk, Kathmandu, Nepal"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 mt-10 pt-6 text-center text-sm text-primary">
          © {new Date().getFullYear()}{" "}
          {setting?.company_name || "Aastha Kala Kendra"}, All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
