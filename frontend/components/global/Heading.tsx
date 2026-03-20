import { Subtitles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface HeadingProps {
  title: string;
  subtitle: string;
  image: string;
}

const Heading = ({ title, image, subtitle }: HeadingProps) => {
  return (
    <div className="relative w-full h-100 overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover object-center"
        priority
        unoptimized
      />

      <div className="font-poppins absolute inset-0 bg-linear-to-t from-white/100 via-white/20  to-white/50" />

      <div className="w-full absolute inset-0 flex items-end justify-center z-10">
        <div className="w-full  px-10 py-10 text-center rounded-t-sm">
          <h1 className="text-3xl font-bold text-primary tracking-wide font-poppins mb-4">
            {title}
          </h1>
          <p className=" font-semibold text-secondary tracking-wider">
            <span>{subtitle}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Heading;
