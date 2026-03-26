import React from "react";
import Image from "next/image";
import type { Metadata } from "next";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative h-64 w-64 mx-auto animate-float">
          <Image
            src="/images/logo.png"
            alt="Page Not Found Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-8xl font-black text-blue-700/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none tracking-tighter">
            404
          </h1>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Oops! Page Not Found.
          </h2>
          <p className="text-gray-600 text-lg">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <div className="pt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-700 text-white font-semibold rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

