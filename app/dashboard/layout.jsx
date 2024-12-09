import React from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";


export default function RootLayout({ children }) {
  return (
    <div className="flex min-h-screen overflow-hidden lg:pl-[300px] lg:justify-end">
      <Sidebar />
      <div className="w-full bg-zinc-50">
        <nav className="py-4 flex items-center justify-between border-b-[1px] border-zinc-200 px-4 lg:px-10 bg-white">
          <ul className="flex items-center gap-5">
            <li>
              <Link href={"/dashboard"} className="text-zinc-600">
                Batches
              </Link>
            </li>
            <li>
              <Link href={"/dashboard"} className="text-zinc-600">
                Notifications
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center ">
              <Link href="/dashboard">PY</Link>
            </div>{" "}
            <span className="hidden lg:block text-zinc-600">Prateek Yadu</span>
          </div>
        </nav>
        <div className="">{children}</div>
      </div>
    </div>
  );
}
