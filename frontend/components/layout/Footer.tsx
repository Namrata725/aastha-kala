import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-2">
              <img
                src="/logo.jpg"
                alt="Aastha Kala Kendra"
                className="h-10 w-10"
              />
              <h2 className="text-xl font-semibold text-blue-600">
                Aastha Kala Kendra
              </h2>
            </div>
            <p className="mt-4 text-gray-600 text-sm">
              Empowering artists and nurturing talent since 1999. Join our
              vibrant community and discover your creative potential.
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

          {/* Programs */}
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
                <span>+977 9841305158</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-linear-to-r from-primary to-secondary p-1.5 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span>aasthakalakendra@gmail.com</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-linear-to-r from-primary to-secondary p-1.5 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span>Narayangopal Chowk, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 mt-10 pt-6 text-center text-sm text-primary">
          © 2026 Aastha Kala Kendra, All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
