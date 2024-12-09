"use client"

import React, { useEffect, useState } from "react";

export default function AnnouncementsPage() {
  const [AllInfos, setAllInfos] = useState(undefined);
  const [render, setRender] = useState(false);

  const getAllInfos = async () => {
    let res = await fetch("http://localhost:3000/api/batch1");
    let data = await res.json();
    setAllInfos(data.data);
  };

  useEffect(() => {
    getAllInfos();
  }, []);

  return (
    <div className="bg-zinc-50 py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl mb-6">Announcements</h1>
        {AllInfos ? (
          AllInfos[0].announcements.map((item, index) => (
            <div
              className=" mt-2 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded flex items-center gap-8"
              key={index}
            >
              <div className="">
                <h4 className="text-base font-medium">{item.title}</h4>
                <p className="text-zinc-500 text-sm mt-1">by {item.mentor}</p>
                <p className="mt-4">{item.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className=" mt-5 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded h-[80vh] flex items-center justify-center">
            <h3 className="text-zinc-500 text-xl lg:text-2xl font-medium">
              No Announcements yet.
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
