"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API error:", err));
  }, []);

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <h1>{message || "Loading..."}</h1>
    </div>
  );
}
