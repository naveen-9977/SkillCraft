"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
// Import icons from lucide-react
import { CalendarClock, Package, CheckCircle2, Circle, XCircle, ArrowRight, AlertTriangle, ClipboardX } from 'lucide-react';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [userTestResults, setUserTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTestsAndResults();
  }, []);

  const fetchTestsAndResults = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch tests
      const testsRes = await fetch('/api/tests');
      const testsData = await testsRes.json();
      if (!testsRes.ok) {
        if (testsRes.status === 401) router.push('/login');
        throw new Error(testsData.error || 'Failed to fetch tests');
      }
      setTests(testsData.tests);

      // Fetch results
      const resultsRes = await fetch('/api/test-results');
      const resultsData = await resultsRes.json();
      if (!resultsRes.ok) {
         if (resultsRes.status === 401) router.push('/login');
        throw new Error(resultsData.error || 'Failed to fetch results');
      }
      setUserTestResults(resultsData.testResults);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  const hasUserTakenTest = (testId) => userTestResults.some(result => result.test?._id === testId);
  const isDeadlinePassed = (deadline) => deadline && new Date() > new Date(deadline);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg">Loading tests...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <div className="flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 mr-3" />
                    <p className="font-bold">Error: {error}</p>
                </div>
            </div>
            <button
                onClick={fetchTestsAndResults}
                className="mt-6 inline-block bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Try Again
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Available Tests
        </h1>

        {tests.length === 0 ? (
          // Empty State
          <div className="text-center text-gray-500 mt-16 flex flex-col items-center">
            <ClipboardX className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No Tests Found</h2>
            <p className="mt-2">There are no tests available for your batch at the moment.</p>
          </div>
        ) : (
          // Grid layout for test cards
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => {
              const taken = hasUserTakenTest(test._id);
              const expired = !taken && isDeadlinePassed(test.deadline);
              
              let status = { text: 'Available', Icon: Circle, color: 'text-blue-600', bgColor: 'bg-blue-100' };
              if (taken) {
                status = { text: 'Completed', Icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' };
              } else if (expired) {
                status = { text: 'Expired', Icon: XCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' };
              }
              
              return (
                // Test Card
                <div key={test._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <div className="p-6 flex-grow flex flex-col">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 self-start px-2.5 py-0.5 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                      <status.Icon className="h-4 w-4" />
                      {status.text}
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-gray-900">{test.title}</h2>
                    <p className="mt-2 text-gray-600 text-sm flex-grow">{test.description}</p>
                    
                    {/* Metadata Section */}
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Batch: <span className="font-medium text-gray-700">{test.batchCode}</span></span>
                      </div>
                       {test.deadline && (
                         <div className={`flex items-center gap-2 ${isDeadlinePassed(test.deadline) && !taken ? 'text-red-600' : ''}`}>
                           <CalendarClock className="h-4 w-4" />
                           <span>Deadline: <span className="font-medium">{new Date(test.deadline).toLocaleDateString()}</span></span>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Action Button Footer */}
                  <div className="bg-gray-50 p-4 rounded-b-lg">
                    {taken ? (
                      <Link href={`/dashboard/tests/${test._id}?view=history`} className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                        View Results
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : expired ? (
                      <button className="w-full bg-gray-300 text-gray-500 font-semibold py-2 px-4 rounded-md cursor-not-allowed" disabled>
                        Deadline Passed
                      </button>
                    ) : (
                      <Link href={`/dashboard/tests/${test._id}`} className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                        Take Test
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}