"use client";

import React, { useEffect, useState } from "react";

export default function MentorDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getMentorStats = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/mentor/dashboard");
        const data = await res.json();

        if (res.ok) {
          setStats(data.stats);
        } else {
          setError(data.error || "Failed to fetch mentor dashboard data.");
        }
      } catch (err) {
        console.error("Error fetching mentor dashboard:", err);
        setError("An error occurred while loading dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    getMentorStats();
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
          onClick={() => window.location.reload()}
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10 mb-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Mentor Dashboard</h1>
      {stats && stats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(batch => (
            <div key={batch._id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800">{batch.batchName}</h3>
              <p className="text-sm text-gray-500 mb-4">{batch.batchCode}</p>
              <p className="text-4xl font-bold text-primary">{batch.studentCount}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700">No Batches Assigned</h2>
            <p className="mt-2">You are not currently assigned to any batches. Please contact an administrator.</p>
        </div>
      )}
    </div>
  );
}
