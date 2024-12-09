"use client";

import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [AllInfos, setAllInfos] = useState(undefined);

  const getAllInfos = async () => {
    let res = await fetch("http://localhost:3000/api/batch1");
    let data = await res.json();
    setAllInfos(data.data);
  };

  useEffect(() => {
    getAllInfos();
  }, []);
  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      {AllInfos? 
      
      <div className="">
        <h1 className="text-xl">Overview</h1>
        <div className=" mt-7 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded">
          <h1 className="text-xl font-semibold">
            {AllInfos[0].batchName}
          </h1>
          <div className="grid grid-cols-1 my-7 gap-7 lg:grid-cols-2 lg:gap-10">
            <div className="">
              <h3 className="font-semibold">Batch created at</h3>
              <span className="text-zinc-500 font-light">{AllInfos[0].batchCreatedAt}</span>
            </div>
            <div className="">
              <h3 className="font-semibold">Batch code</h3>
              <span className="text-zinc-500 font-light">{AllInfos[0].batchCode}</span>
            </div>
            <div className="">
              <h3 className="font-semibold">Subjects</h3>
              <span className="text-zinc-500 font-light ">
               {AllInfos[0].subjects}
              </span>
            </div>
          </div>
        </div>
      </div>
      : <div></div> }
    </div>
  );
}
