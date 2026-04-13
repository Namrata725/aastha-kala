"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--primary)",
          color: "#fff",
          fontSize: "14px",
        },
        success: {
          style: { background: "var(--success)" },
        },
        error: {
          style: { background: "var(--error)" },
        },
      }}
    />
  );
}
