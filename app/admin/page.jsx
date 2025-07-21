"use client";

import React, { useEffect, useState } from "react";

export default function Dashboard() {
  // Renamed state variables for clarity and to avoid confusion with student data
  const [adminOverviewStats, setAdminOverviewStats] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAdminOverviewStats = async () => { // Renamed function
    setLoading(true);
    setError("");
    try {
      // NEW: Call the correct admin-specific API for dashboard overview
      // Assuming you have a route like /api/admin/dashboard-overview or similar
      // If not, you might need to create one to fetch overall stats (users, batches, etc.)
      // For now, I'll use /api/admin/dashboard-overview as it exists in your provided files.
      let res = await fetch("/api/admin/dashboard-overview"); 
      let data = await res.json();

      if (res.ok) {
        setAdminOverviewStats(data.stats); // Assuming data.stats contains the overview object
      } else {
        setError(data.error || "Failed to fetch admin overview data.");
      }
    } catch (err) {
      console.error("Error fetching admin overview:", err);
      setError("An error occurred while loading admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminOverviewStats(); // Call the new function
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
          onClick={getAdminOverviewStats} // Call the new function
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Display admin overview statistics
  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10 mb-12">
      <div className="text-2xl text-center mt-4">Admin Dashboard Overview</div>
      {adminOverviewStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Pending Students</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{adminOverviewStats.pendingStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Approved Students</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{adminOverviewStats.approvedStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Batches</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalBatches}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Tests</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalTests}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Assignments</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalAssignments}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Study Materials</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalStudyMaterials}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Announcements</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalAnnouncements}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Submissions</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalSubmissions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Test Results</h3>
            <p className="text-3xl font-bold text-primary mt-2">{adminOverviewStats.totalTestResults}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          No overview data available.
        </div>
      )}
    </div>
  );
}
