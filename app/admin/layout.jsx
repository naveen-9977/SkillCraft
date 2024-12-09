import React from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <div className="flex min-h-screen overflow-hidden lg:pl-[300px] lg:justify-end">
      <Sidebar />
      <div className="w-full bg-zinc-50">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
