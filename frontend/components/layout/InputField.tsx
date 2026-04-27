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
  id?: string;
  min?: number;
  max?: number;
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
  id,
  min,
  max,
}) => {
  const inputId = id || label.replace(/\s+/g, "_").toLowerCase();
  const isSelect = type === "select";

  // Normalize error to string
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div id={inputId} className="w-full flex flex-col gap-1.5 animate-fade-in">
      {/* Label */}
      <label className="flex items-center text-[11px] font-black uppercase tracking-[0.15em] text-text-muted gap-2 ml-1">
        {label}
        {required && <span className="text-error font-black">*</span>}
      </label>

      {/* Container */}
      <div
        className={`relative flex items-center rounded-lg border transition-all duration-300 group/input
          ${errorMessage ? "border-error bg-error/5" : "border-border bg-background hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 shadow-sm"}
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex-1 flex items-center px-3 py-2">
          {/* TEXTAREA */}
          {textarea ? (
            <textarea
              value={value ?? ""}
              onChange={onChange}
              rows={4}
              disabled={disabled}
              className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted/40 resize-none font-medium"
              placeholder={placeholder ?? `Enter ${label.toLowerCase()}...`}
            />
          ) : isSelect ? (
            // DROPDOWN
            <select
              multiple={multiple}
              value={
                multiple
                  ? Array.isArray(value)
                    ? value
                    : value
                      ? value.split(",").map((v: string) => v.trim())
                      : []
                  : (value ?? "")
              }
              onChange={(e) => {
                if (multiple) {
                  const options = e.target.options;
                  const values = [];
                  for (let i = 0, l = options.length; i < l; i++) {
                    if (options[i].selected) {
                      values.push(options[i].value);
                    }
                  }
                  onChange?.({ target: { value: values.join(", ") } } as any);
                } else {
                  onChange?.(e);
                }
              }}
              disabled={disabled}
              className={`w-full bg-transparent outline-none text-sm text-text-primary font-medium appearance-none ${multiple ? "min-h-[100px] py-1" : ""}`}
            >
              {!multiple && (
                <option value="" className="text-text-muted">
                  Select {label.toLowerCase()}
                </option>
              )}
              {options.map((opt, idx) => (
                <option
                  key={idx}
                  value={opt.value}
                  className="bg-surface text-text-primary py-1.5 px-3"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            // NORMAL INPUT
            <div className="flex items-center gap-2.5 w-full">
              {Icon && <Icon className="w-3.5 h-3.5 text-text-muted group-focus-within/input:text-primary transition-colors shrink-0" />}

              <input
                type={type}
                value={value ?? ""}
                onChange={onChange}
                disabled={disabled}
                min={min}
                max={max}
                className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted/40 font-medium"
                placeholder={placeholder ?? `Enter ${label.toLowerCase()}...`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      <div className="min-h-[16px] px-1">
        {errorMessage && (
          <p className="text-error text-[10px] font-black uppercase tracking-widest leading-none mt-1 animate-slide-up">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default InputField;
