import Link from "next/link";
import React from "react";

export default function Tests() {
  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl mb-2">Tests</h1>
        <div className=" mt-5 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded">
          <div className="flex gap-4 items-center">
            <h1 className="font-semibold">Syllogism Test 1 Level 1 ( Y )</h1>
            <span className="bg-emerald-100 text-sm text-emerald-600 font-medium px-5 py-[2px] rounded-full">Active</span>
          </div>
          <div className="text-sm text-zinc-500 flex flex-col gap-1 mt-1">
            <p>created by  Ashish Kumar Singh</p>
            <p>Vailed till 24 sep 2024 10:32 AM to 28 sep 2024 12:00 PM</p>
          </div>
          <div className="text-sm flex flex-col w-fit mt-7 gap-2">
            <p className="text-primary">+1 Attempt</p>
            <Link href="/dashboard/tests/abc" className="text-white bg-primary py-2 px-4 rounded">
              Take Test
            </Link>
          </div>
        </div>
        <div className=" mt-5 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded">
          <div className="flex gap-4 items-center">
            <h1 className="font-semibold">Coding Decoding Level 1 Test </h1>
            <span className="bg-rose-100 text-sm text-rose-500 font-medium px-5 py-[2px] rounded-full">Over</span>
          </div>
          <div className="text-sm text-zinc-500 flex flex-col gap-1 mt-1">
            <p>created by  Ashish Kumar Singh</p>
            <p>Vailed till 24 sep 2024 10:32 AM to 28 sep 2024 12:00 PM</p>
          </div>
          <div className="text-sm flex flex-col w-fit mt-7 gap-2">
            <Link href="/dashboard/tests/abc" className="text-white bg-primary py-2 px-4 rounded">
              View Result
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
