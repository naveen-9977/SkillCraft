import React from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AdminPannel from "../components/AdminPannel";

export default function RootLayout({ children }) {
  return (
    <div className="flex min-h-screen overflow-hidden lg:pl-[300px] lg:justify-end">
      <AdminPannel />
      <div className="w-full bg-zinc-50 min-h-screen overflow-auto">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
