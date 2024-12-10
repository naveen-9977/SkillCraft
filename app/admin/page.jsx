"use client";

import React, { useEffect, useState } from "react";

export default function Dashboard({ params }) {
  const [AllInfos, setAllInfos] = useState(undefined);
  const [batchName, setBatchName] = useState(undefined);
  const [batchCreatedAt, setBatchCreatedAt] = useState(undefined);
  const [batchCode, setBatchCode] = useState(undefined);
  const [subjects, setSubjects] = useState(undefined);

  const getAllInfos = async () => {
    let res = await fetch("http://localhost:3000/api/batch1");
    let data = await res.json();
    setAllInfos(data.data);
    setBatchName(data.data[0].batchName);
    setBatchCreatedAt(data.data[0].batchCreatedAt);
    setBatchCode(data.data[0].batchCode);
    setSubjects(data.data[0].subjects);
  };

  const updateData = async () => {
    let res = await fetch("http://localhost:3000/api/admin/overview", {
      method: "POST",
      body: JSON.stringify({
        id: AllInfos[0]._id,
        batchName,
        batchCreatedAt,
        batchCode,
        subjects,
      }),
    });

    if (res.status == 200) {
      console.log("works")
    } else {
    }
  };

  useEffect(() => {
    getAllInfos();
  }, []);

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10 mb-12">
      {AllInfos ? (
        AllInfos.map((item, index) => (
          <div className="flex flex-col gap-8 " key={index}>
            <div className="text-2xl text-center mt-4">Overview</div>
            <div className="flex flex-col gap-2">
              <label htmlFor="batchname" className="text-lg">
                Batch Name
              </label>
              <input
                type="text"
                id="batchname"
                value={batchName}
                onChange={(e) => {
                  setBatchName(e.target.value);
                }}
                className="p-2 ring-2 ring-zinc-400 focus:ring-zinc-700 outline-none rounded"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="createdat" className="text-lg">
                Batch created at
              </label>
              <input
                type="text"
                id="createdat"
                value={batchCreatedAt}
                onChange={(e) => {
                  setBatchCreatedAt(e.target.value);
                }}
                className="p-2 ring-2 ring-zinc-400 focus:ring-zinc-700 outline-none rounded"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="code" className="text-lg">
                Batch code
              </label>
              <input
                type="text"
                id="code"
                value={batchCode}
                onChange={(e) => {
                  setBatchCode(e.target.value);
                }}
                className="p-2 ring-2 ring-zinc-400 focus:ring-zinc-700 outline-none rounded"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="subjects" className="text-lg">
                Subjects
              </label>
              <input
                type="text"
                id="subjects"
                value={subjects}
                onChange={(e) => {
                  setSubjects(e.target.value);
                }}
                className="p-2 ring-2 ring-zinc-400 focus:ring-zinc-700 outline-none rounded"
              />
            </div>
            <button
              className="bg-primary text-white py-1 px-4 rounded w-fit self-end"
              onClick={() => {
                updateData();
              }}
            >
              Save
            </button>
          </div>
        ))
      ) : (
        <div className=""></div>
      )}
    </div>
  );
}
