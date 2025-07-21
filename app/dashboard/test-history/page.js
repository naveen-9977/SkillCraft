"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TestHistoryPage() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchTestHistory();
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/test-results"); // Fetch test results for the current user
      const data = await res.json();

      if (res.ok) {
        setTestResults(data.testResults);
      } else {
        setError(data.error || "Failed to fetch test history.");
        // If not authenticated, redirect to login
        if (res.status === 401) {
          router.push("/login");
        }
      }
    } catch (err) {
      console.error("Error fetching test history:", err);
      setError("An error occurred while loading your test history.");
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
          onClick={() => router.push("/dashboard")}
          className="text-primary hover:underline mt-4"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Your Test History</h1>

        {testResults.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
            You haven't taken any tests yet.
            <Link href="/dashboard/tests" className="block mt-4 text-primary hover:underline">
              Go to Tests
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {testResults.map((result) => (
              <div
                key={result._id}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      {result.test ? result.test.title : "Unknown Test"}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Score: {result.score} / {result.totalQuestions} (
                      {((result.score / result.totalQuestions) * 100).toFixed(2)}%)
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted:{" "}
                    {new Date(result.submittedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {/* Optionally, add a link to review the test details if needed */}
                {/* <Link 
                  href={`/dashboard/tests/${result.test._id}?resultId=${result._id}`} 
                  className="text-primary hover:underline text-sm"
                >
                  Review Test
                </Link> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
