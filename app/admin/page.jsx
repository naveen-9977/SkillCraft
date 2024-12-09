"use client";

import React, { useEffect, useState } from "react";

export default function Dashboard({ params }) {
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
      {AllInfos ? (
        AllInfos.map((item, index)=>(
        <div className=" " key={index}>
          <label htmlFor="batchname">Batch Name</label>
          <input type="text" id="batchname" value={item.batchName} />
          <label htmlFor="createdat">Batch created at</label>
          <input type="text" id="createdat" value={item.batchCreatedAt} />
          <label htmlFor="code">Batch code</label>
          <input type="text" id="code" value={item.batchCode} />
          <label htmlFor="subjects">Subjects</label>
          <input type="text" id="subjects"  value={item.subjects} />
        </div>
        ))
      ) : (
        <div className=""></div>
      )}
    </div>
  );
}
