"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      toast.success("Logged in successfully!");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6ff] relative overflow-hidden">
      {/*  FLOATING BLOBS */}
      <div className="absolute top-[8%] left-[12%] w-80 h-80 bg-primary/35 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute top-[60%] left-[5%] w-72 h-72 bg-indigo-400/30 rounded-full blur-2xl animate-float-medium" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-secondary/35 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute top-[30%] right-[20%] w-64 h-64 bg-pink-400/30 rounded-full blur-2xl animate-float-fast" />

      {/*  LOGIN CARD */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white/40">
        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div
            className={`relative transition ${focused === "email" ? "scale-[1.02]" : ""}`}
          >
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          {/* Password */}
          <div
            className={`relative transition ${focused === "password" ? "scale-[1.02]" : ""}`}
          >
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium bg-linear-to-r from-primary to-secondary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

      
      </div>
    </div>
  );
}
