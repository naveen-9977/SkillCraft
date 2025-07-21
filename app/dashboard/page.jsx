"use client";

import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [batchInfos, setBatchInfos] = useState([]); // Changed to an array for multiple batches
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getBatchInfos = async () => { // Renamed function
    setLoading(true);
    setError("");
    try {
      // The /api/batch1 route now returns an array of batch objects.
      let res = await fetch("/api/batch1");
      let data = await res.json();

      if (res.ok) {
        setBatchInfos(data.data); // data.data will now be an array of objects
      } else {
        setError(data.error || "Failed to fetch batch information.");
      }
    } catch (err) {
      console.error("Error fetching batch info:", err);
      setError("An error occurred while loading your batch details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBatchInfos(); // Call the new function
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-red-600 mb-4 text-center px-4">{error}</div>
        <button
          onClick={getBatchInfos} // Call the new function
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <h1 className="text-xl mb-6">Batches Overview</h1>
      {batchInfos.length === 0 ? ( // Check array length
        <div className="text-center text-gray-500 mt-8">
          No batch information available for your account. Please contact your administrator.
        </div>
      ) : (
        <div className="grid gap-6"> {/* Grid for multiple batches */}
          {batchInfos.map((batchInfo, index) => ( // Map over the array
            <div key={index} className="py-4 bg-white px-4 border-[1px] border-zinc-200 rounded">
              <h2 className="text-xl font-semibold mb-4">
                {batchInfo.batchName}
              </h2>
              <div className="grid grid-cols-1 my-7 gap-7 lg:grid-cols-2 lg:gap-10">
                <div className="">
                  <h3 className="font-semibold">Batch created at</h3>
                  <span className="text-zinc-500 font-light">{batchInfo.batchCreatedAt}</span>
                </div>
                <div className="">
                  <h3 className="font-semibold">Batch code</h3>
                  <span className="text-zinc-500 font-light">{batchInfo.batchCode}</span>
                </div>
                <div className="">
                  <h3 className="font-semibold">Subjects</h3>
                  <span className="text-zinc-500 font-light ">
                   {batchInfo.subjects}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
