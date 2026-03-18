"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
          fontSize: "14px",
        },
        success: {
          style: { background: "green" },
        },
        error: {
          style: { background: "red" },
        },
      }}
    />
  );
}
