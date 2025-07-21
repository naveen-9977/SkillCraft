"use client";

import React, { useEffect, useState } from "react";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch announcements for the current user's batch code
      const res = await fetch("/api/announcements");
      const data = await res.json();

      if (res.ok) {
        setAnnouncements(data.announcements);
      } else {
        setError(data.error || "Failed to fetch announcements.");
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("An error occurred while loading announcements.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchAnnouncements}
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl mb-6">Announcements</h1>
        {announcements.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded h-[80vh] flex items-center justify-center">
            <h3 className="text-zinc-500 text-xl lg:text-2xl font-medium">
              No Announcements yet for your batch.
            </h3>
          </div>
        ) : (
          announcements.map((item, index) => (
            <div
              className="mt-2 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded flex flex-col gap-8"
              key={index}
            >
              <div className="">
                <h4 className="text-base font-medium">{item.title}</h4>
                <p className="text-zinc-500 text-sm mt-1">by {item.mentor}</p>
                <p className="text-zinc-500 text-xs mt-1">Batch: {item.batchCode}</p>
                <p className="mt-4">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}