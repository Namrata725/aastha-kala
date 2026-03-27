import React from "react";
import Dashboard from "./DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Page",
};

const page = () => {
  return <Dashboard />;
};

export default page;
