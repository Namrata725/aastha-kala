"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/components/layout/InputField";
import {
  Building2,
  MapPin,
  Navigation,
  Phone,
  FileText,
  Image,
  Facebook,
  Instagram,
  Music,
  Twitter,
  Calendar,
  Award,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Type,
  AlignLeft,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

// Types

interface Setting {
  company_name: string;
  address: string;
  location: string;
  phone: string;
  email: string;
  about: string;
  about_short: string;
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
}

interface Stats {
  experience: string;
  awards: string;
  instructors: string;
  students: string;
  success_rate: string;
}

interface ContentItem {
  title: string;
  desc: string;
}

// tabs

const tabs = [
  { id: "general", label: "General" },
  { id: "social", label: "Social Links" },
  { id: "stats", label: "Stats" },
  { id: "whyus", label: "Why Us" },
  { id: "mission", label: "Mission" },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // GENERAL
  const [setting, setSetting] = useState<Setting>({
    company_name: "",
    address: "",
    location: "",
    phone: "",
    email: "",
    about: "",
    about_short: "",
  });

  // SOCIAL
  const [social, setSocial] = useState<SocialLinks>({
    facebook: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  });

  // STATS
  const [stats, setStats] = useState<Stats>({
    experience: "",
    awards: "",
    instructors: "",
    students: "",
    success_rate: "",
  });

  // WHY US
  const [whyUsItems, setWhyUsItems] = useState<ContentItem[]>([
    { title: "", desc: "" },
  ]);

  // MISSION
  const [missionItems, setMissionItems] = useState<ContentItem[]>([
    { title: "", desc: "" },
  ]);

  // fetch

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to fetch settings");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/settings`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();

        if (data.success) {
          const s = data.data.setting ?? {};

          if (s.logo) setLogoPreview(s.logo);
          if (s.banner) setBannerPreview(s.banner);

          setSetting({
            company_name: s.company_name || "",
            address: s.address || "",
            location: s.location_map || "",
            phone: s.phone || "",
            email: s.email || "",
            about: s.about || "",
            about_short: s.about_short || "",
          });

          const soc = data.data.social_links;
          setSocial({
            facebook: soc?.facebook || "",
            instagram: soc?.instagram || "",
            tiktok: soc?.tiktok || "",
            twitter: soc?.x || "",
          });

          const st = s;
          setStats({
            experience: st.years_of_experience?.toString() || "",
            awards: st.awards?.toString() || "",
            instructors: st.number_of_instructors?.toString() || "",
            students: st.number_of_students?.toString() || "",
            success_rate: st.success_rate?.toString() || "",
          });

          if (
            data.data.why_us &&
            Array.isArray(data.data.why_us) &&
            data.data.why_us.length > 0
          ) {
            setWhyUsItems(
              data.data.why_us.map((item: any) => ({
                title: item.title,
                desc: item.description,
              })),
            );
          }

          const mission = data.data.setting?.mission;

          if (mission && Array.isArray(mission)) {
            setMissionItems(
              mission.map((item: any) => ({
                title: item.title,
                desc: item.description,
              })),
            );
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch settings");
      }
    };

    fetchSettings();
  }, []);

  // save

  const saveSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to save settings");
      return;
    }

    const formData = new FormData();

    // GENERAL
    formData.append("company_name", setting.company_name);
    formData.append("address", setting.address);
    formData.append("location_map", setting.location);
    formData.append("phone", setting.phone);
    formData.append("email", setting.email);
    formData.append("about", setting.about);
    formData.append("about_short", setting.about_short);

    // STATS
    formData.append("years_of_experience", stats.experience);
    formData.append("awards", stats.awards);
    formData.append("number_of_instructors", stats.instructors);
    formData.append("number_of_students", stats.students);
    formData.append("success_rate", stats.success_rate);

    // SOCIAL
    formData.append("social_links[facebook]", social.facebook);
    formData.append("social_links[instagram]", social.instagram);
    formData.append("social_links[tiktok]", social.tiktok);
    formData.append("social_links[x]", social.twitter);

    // WHY US
    whyUsItems.forEach((item, index) => {
      formData.append(`why_us[${index}][title]`, item.title);
      formData.append(`why_us[${index}][description]`, item.desc);
    });

    // MISSION
    formData.append("mission", JSON.stringify(missionItems));

    // FILES
    if (logoFile) formData.append("logo", logoFile);
    if (bannerFile) formData.append("banner", bannerFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/settings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Settings saved successfully");
      } else {
        let errorMessage = data.message;

        if (data.errors) {
          const firstField = Object.keys(data.errors)[0];
          if (firstField && data.errors[firstField]?.length) {
            errorMessage = data.errors[firstField][0];
          }
        }

        toast.error(errorMessage || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="relative p-6 max-w-7xl mx-auto rounded-2xl overflow-hidden bg-primary/10 border border-primary/20 backdrop-blur-lg">
      <div className="relative z-10">
        {/* Tabs */}

        <div className="relative mb-8 border-b border-primary/10">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-2.5 rounded-t-xl font-semibold text-sm transition-all duration-300 cursor-pointer
          
          ${isActive ? "text-white" : "text-primary/60 hover:text-white"}
          
          `}
                >
                  <span
                    className={`absolute inset-0 rounded-t-xl transition-all duration-300
            ${
              isActive
                ? "bg-linear-to-r from-primary/20 to-secondary/20 border border-primary/30 shadow-md shadow-primary/10"
                : "bg-transparent"
            }
            `}
                  />
                  <span className="relative z-10 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {tab.label}
                  </span>
                  <span className="absolute inset-0 rounded-t-xl opacity-0 hover:opacity-100 transition-all duration-300 bg-white/5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-6">
          {/* GENERAL */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Company Name"
                icon={Building2}
                value={setting.company_name}
                onChange={(e) =>
                  setSetting({ ...setting, company_name: e.target.value })
                }
              />
              <InputField
                label="Address"
                icon={MapPin}
                value={setting.address}
                onChange={(e) =>
                  setSetting({ ...setting, address: e.target.value })
                }
              />
              <InputField
                label="Map Address"
                icon={Navigation}
                value={setting.location}
                onChange={(e) =>
                  setSetting({ ...setting, location: e.target.value })
                }
              />
              <InputField
                label="Phone"
                icon={Phone}
                value={setting.phone}
                onChange={(e) =>
                  setSetting({ ...setting, phone: e.target.value })
                }
              />
              <InputField
                label="Email"
                icon={Mail}
                value={setting.email}
                onChange={(e) =>
                  setSetting({ ...setting, email: e.target.value })
                }
              />
              <InputField
                label="Short About"
                icon={Type}
                value={setting.about_short}
                onChange={(e) =>
                  setSetting({ ...setting, about_short: e.target.value })
                }
              />
              {/* LOGO */}
              <div>
                <label className="flex items-center text-sm mb-1 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent font-medium gap-2">
                  {<Image className="w-4 h-4 text-primary" />}
                  Logo
                </label>

                <div
                  className="w-full cursor-pointer rounded-lg border border-white/10 bg-linear-to-r from-primary/20 to-secondary/20 transition flex flex-col items-center justify-center p-4 relative"
                  onClick={() => document.getElementById("logoInput")?.click()}
                >
                  {logoPreview ? (
                    <div className="relative w-full">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-32 object-contain rounded-lg"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition rounded-lg">
                        <span className="text-white text-sm font-medium">
                          Change Logo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <p className="text-sm">Click to upload logo</p>
                      <p className="text-xs text-white/70">PNG, JPG, WEBP</p>
                    </div>
                  )}

                  <input
                    id="logoInput"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              {/* BANNER */}

              <div>
                <label className="flex items-center text-sm mb-1 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent font-medium gap-2">
                  <Image className="w-4 h-4 text-primary" />
                  Banner
                </label>

                <div
                  className="w-full cursor-pointer rounded-lg border border-white/10 bg-linear-to-r from-primary/20 to-secondary/20 transition flex flex-col items-center justify-center p-4 relative"
                  onClick={() =>
                    document.getElementById("bannerInput")?.click()
                  }
                >
                  {bannerPreview ? (
                    <div className="relative w-full">
                      <img
                        src={bannerPreview}
                        alt="Banner Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition rounded-lg">
                        <span className="text-white text-sm font-medium">
                          Change Banner
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <p className="text-sm">Click to upload banner</p>
                      <p className="text-xs text-white/70">PNG, JPG, WEBP</p>
                    </div>
                  )}

                  <input
                    id="bannerInput"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBannerFile(file);
                        setBannerPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              <InputField
                label="About"
                textarea
                icon={FileText}
                value={setting.about}
                onChange={(e) =>
                  setSetting({ ...setting, about: e.target.value })
                }
              />
            </div>
          )}

          {/* SOCIAL */}
          {activeTab === "social" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Facebook"
                icon={Facebook}
                value={social.facebook}
                onChange={(e) =>
                  setSocial({ ...social, facebook: e.target.value })
                }
              />
              <InputField
                label="Instagram"
                icon={Instagram}
                value={social.instagram}
                onChange={(e) =>
                  setSocial({ ...social, instagram: e.target.value })
                }
              />
              <InputField
                label="TikTok"
                icon={Music}
                value={social.tiktok}
                onChange={(e) =>
                  setSocial({ ...social, tiktok: e.target.value })
                }
              />
              <InputField
                label="X (Twitter)"
                icon={Twitter}
                value={social.twitter}
                onChange={(e) =>
                  setSocial({ ...social, twitter: e.target.value })
                }
              />
            </div>
          )}

          {/* STATS */}
          {activeTab === "stats" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Years of Experience"
                icon={Calendar}
                value={stats.experience}
                onChange={(e) =>
                  setStats({ ...stats, experience: e.target.value })
                }
              />
              <InputField
                label="Awards & Recognition"
                icon={Award}
                value={stats.awards}
                onChange={(e) => setStats({ ...stats, awards: e.target.value })}
              />
              <InputField
                label="Expert Instructors"
                icon={UserCheck}
                value={stats.instructors}
                onChange={(e) =>
                  setStats({ ...stats, instructors: e.target.value })
                }
              />
              <InputField
                label="Students Trained"
                icon={GraduationCap}
                value={stats.students}
                onChange={(e) =>
                  setStats({ ...stats, students: e.target.value })
                }
              />
              <InputField
                label="Success Rate (%)"
                icon={TrendingUp}
                value={stats.success_rate}
                onChange={(e) =>
                  setStats({ ...stats, success_rate: e.target.value })
                }
              />
            </div>
          )}

          {/* WHY US */}
          {activeTab === "whyus" && (
            <div className="space-y-6">
              {whyUsItems.map((item, idx) => (
                <div
                  key={idx}
                  className="space-y-2 border border-white/10 p-4 rounded-lg relative"
                >
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-red-500"
                    onClick={() => {
                      const updated = whyUsItems.filter((_, i) => i !== idx);
                      setWhyUsItems(updated);
                    }}
                  >
                    Remove
                  </button>
                  <InputField
                    label={`Title #${idx + 1}`}
                    icon={Type}
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...whyUsItems];
                      updated[idx].title = e.target.value;
                      setWhyUsItems(updated);
                    }}
                  />
                  <InputField
                    label={`Description #${idx + 1}`}
                    textarea
                    icon={AlignLeft}
                    value={item.desc}
                    onChange={(e) => {
                      const updated = [...whyUsItems];
                      updated[idx].desc = e.target.value;
                      setWhyUsItems(updated);
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="px-6 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-lg"
                onClick={() =>
                  setWhyUsItems([...whyUsItems, { title: "", desc: "" }])
                }
              >
                Add Why Us Item
              </button>
            </div>
          )}

          {/* MISSION */}
          {activeTab === "mission" && (
            <div className="space-y-6">
              {missionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="space-y-2 border border-white/10 p-4 rounded-lg relative"
                >
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-red-500"
                    onClick={() => {
                      const updated = missionItems.filter((_, i) => i !== idx);
                      setMissionItems(updated);
                    }}
                  >
                    Remove
                  </button>
                  <InputField
                    label={`Misiion ${idx + 1}`}
                    icon={Type}
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...missionItems];
                      updated[idx].title = e.target.value;
                      setMissionItems(updated);
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="px-6 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-lg"
                onClick={() =>
                  setMissionItems([...missionItems, { title: "", desc: "" }])
                }
              >
                Add Mission Item
              </button>
            </div>
          )}
        </div>

        {/* SAVE */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSettings}
            className="px-6 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-lg"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
