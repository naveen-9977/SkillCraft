"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import './leaderboard.css'; // Import the CSS file

// Icon for the batch card
const IconFolder = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg> );

export default function AdminLeaderboardPage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTestResults, setSelectedTestResults] = useState([]);
  const [selectedTestTitle, setSelectedTestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    setError("");
    setSelectedBatch(null);
    setTests([]);
    setSelectedTestResults([]);
    setSelectedTestTitle("");

    try {
      const res = await fetch("/api/admin/leaderboard");
      const data = await res.json();

      if (res.ok) {
        setBatches(data.batches || []);
      } else {
        setError(data.error || "Failed to fetch batches.");
      }
    } catch (err) {
      setError("An error occurred while loading batches.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsForBatch = async (batch) => {
    setLoading(true);
    setError("");
    setSelectedBatch(batch);

    try {
        const res = await fetch(`/api/admin/leaderboard?batchCode=${batch.batchCode}`);
        const data = await res.json();
        if (res.ok) {
            setTests(data.testSummary || []);
        } else {
            setError(data.error || "Failed to fetch tests for the batch.");
        }
    } catch (err) {
        setError("An error occurred while fetching tests.");
    } finally {
        setLoading(false);
    }
  };

  const fetchTestScores = async (testId, testTitle) => {
    setLoading(true);
    setError("");
    setSelectedTestTitle(testTitle);

    try {
      const res = await fetch(`/api/admin/leaderboard?testId=${testId}`);
      const data = await res.json();

      if (res.ok) {
        setSelectedTestResults(data.testResults || []);
      } else {
        setError(data.error || `Failed to fetch scores for ${testTitle}.`);
      }
    } catch (err) {
      setError(`An error occurred while loading scores for ${testTitle}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
    setTests([]);
    setSelectedTestResults([]);
    setSelectedTestTitle("");
  };

  const handleBackToTests = () => {
    setSelectedTestResults([]);
    setSelectedTestTitle("");
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
          onClick={fetchBatches}
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Leaderboard</h1>

        {!selectedBatch ? (
          <>
            <h2 className="text-xl font-medium mb-4">Select a Batch</h2>
            {batches.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
                No batches found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                  <div
                    key={batch._id}
                    className="leaderboard-batch-card"
                    onClick={() => fetchTestsForBatch(batch)}
                  >
                    <IconFolder />
                    <h2 className="leaderboard-batch-card-title">{batch.batchName}</h2>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : !selectedTestTitle ? (
            <>
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={handleBackToBatches} className="text-primary hover:underline">
                        &larr; Back to Batches
                    </button>
                    <h2 className="text-xl font-medium">Tests in {selectedBatch.batchName}</h2>
                </div>
                {tests.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
                        No tests found for this batch.
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {tests.map((test) => (
                            <div
                                key={test._id}
                                className="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => fetchTestScores(test._id, test.title)}
                            >
                                <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                                <p className="text-gray-600 mb-2">{test.description}</p>
                                <p className="text-sm text-gray-500">
                                Total students who gave this test:{" "}
                                <span className="font-medium">{test.totalStudents}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <button onClick={handleBackToTests} className="text-primary hover:underline">
                &larr; Back to Tests
              </button>
              <h2 className="text-xl font-medium">{selectedTestTitle} Scores</h2>
            </div>
            {selectedTestResults.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
                No students have taken this test yet.
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Taken</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTestResults.map((result, index) => (
                        <tr key={result._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.student ? result.student.name : "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.student ? result.student.email : "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.score} / {result.totalQuestions}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{((result.score / (result.totalQuestions || 1)) * 100).toFixed(2)}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(result.submittedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}