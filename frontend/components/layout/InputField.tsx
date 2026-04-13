"use client";

import React from "react";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  icon?: any;
  value?: any;
  onChange?: (e: any) => void;
  textarea?: boolean;
  type?: string;
  options?: Option[];
  imagePreview?: string | null;
  required?: boolean;
  disabled?: boolean;
  error?: string | string[];
  placeholder?: string;
}

const InputField: React.FC<Props & { multiple?: boolean }> = ({
  label,
  icon: Icon,
  value,
  onChange,
  textarea = false,
  type = "text",
  options = [],
  required = false,
  disabled = false,
  error,
  multiple = false,
  placeholder,
}) => {
  const inputId = label.replace(/\s+/g, "_").toLowerCase();
  const isSelect = type === "select";
  
  // Normalize error to string
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className="w-full flex flex-col gap-0.5">
      {/* Label */}
      <label className="flex items-center text-[11px] mb-0.5 font-bold uppercase tracking-wider gap-2">
        <div className="flex items-center gap-2 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent italic">
          {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
          {label}
        </div>
        {required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
      </label>

      {/* Container */}
      <div className={`p-0.5 rounded-xl bg-linear-to-r ${errorMessage ? 'from-red-500/40 to-red-500/40' : 'from-primary/20 to-secondary/20'}`}>
        <div className={`rounded-xl px-3 py-1.5 bg-primary/10 backdrop-blur-md border ${errorMessage ? 'border-red-500/40' : 'border-primary/10'} shadow-sm transition-all duration-300 focus-within:bg-primary/15 ${errorMessage ? 'focus-within:border-red-500' : 'focus-within:border-primary/20 hover:border-primary/30'}`}>
          {/* TEXTAREA */}
          {textarea ? (
            <textarea
              value={value ?? ""}
              onChange={onChange}
              rows={4}
              disabled={disabled}
              className={`w-full bg-transparent outline-none text-black text-sm placeholder:text-black/30 resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder={placeholder ?? `Enter ${label}...`}
            />
          ) : isSelect ? (
            // DROPDOWN
            <div className="relative group/select">
                <select
                    multiple={multiple}
                    value={multiple ? (Array.isArray(value) ? value : (value ? value.split(',').map((v: string) => v.trim()) : [])) : (value ?? "")}
                    onChange={(e) => {
                        if (multiple) {
                            const options = e.target.options;
                            const values = [];
                            for (let i = 0, l = options.length; i < l; i++) {
                                if (options[i].selected) {
                                    values.push(options[i].value);
                                }
                            }
                            onChange?.({ target: { value: values.join(', ') } } as any);
                        } else {
                            onChange?.(e);
                        }
                    }}
                    disabled={disabled}
                    className={`w-full bg-transparent outline-none text-black text-sm placeholder:text-black/30 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${multiple ? 'min-h-[80px] py-1' : ''}`}
                >
                    {!multiple && (
                        <option value="" className="bg-white text-black/60">
                            Select {label}
                        </option>
                    )}
                    {options.map((opt, idx) => (
                        <option
                            key={idx}
                            value={opt.value}
                            className="bg-white text-black py-1 px-2 hover:bg-primary/10"
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>
                {multiple && <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/select:opacity-100 transition-opacity"><span className="text-[9px] bg-black/10 px-1 rounded text-gray-400">Ctrl+Click</span></div>}
            </div>
          ) : (
            // NORMAL INPUT
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-3.5 h-3.5 text-black/40 shrink-0" />}

              <input
                type={type}
                value={value ?? ""}
                onChange={onChange}
                disabled={disabled}
                className={`w-full bg-transparent outline-none text-black text-sm placeholder:text-black/30 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={placeholder ?? `Enter ${label}...`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE (Reserved space) */}
      <div className="min-h-[14px] px-1 overflow-hidden">
        {errorMessage && (
          <p className="text-red-500 text-[10px] font-bold leading-none mt-1 transition-all duration-200">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default InputField;
