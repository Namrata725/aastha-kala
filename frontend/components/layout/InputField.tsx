"use client";

import React from "react";

interface Props {
  label: string;
  icon?: any;
  value?: any;
  onChange?: (e: any) => void;
  textarea?: boolean;
  type?: string;
  imagePreview?: string | null;
}

const InputField: React.FC<Props> = ({
  label,
  icon: Icon,
  value,
  onChange,
  textarea = false,
  type = "text",
  imagePreview,
}) => {
  const inputId = label.replace(/\s+/g, "_").toLowerCase();

  return (
    <div className="w-full">
      {/* Label */}
      <label className="flex items-center text-sm mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-medium gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        {label}
      </label>

      {/* Container */}
      <div className="p-[1px] rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="rounded-xl px-3 py-2 bg-primary/10 backdrop-blur-md border border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition duration-300 focus-within:bg-primary/15 focus-within:border-primary/20">
          {/* TEXTAREA */}
          {textarea ? (
            <textarea
              value={value}
              onChange={onChange}
              rows={4}
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40 resize-none"
              placeholder={`Enter ${label}`}
            />
          ) : (
            // normal input
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-white/60 flex-shrink-0" />}

              <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
                placeholder={`Enter ${label}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputField;
