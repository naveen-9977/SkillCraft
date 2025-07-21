"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'; // NEW: Import useRouter for redirection

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null);
  const [submissionText, setSubmissionText] = useState(''); 
  const [submissionFile, setSubmissionFile] = useState(null); 
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    fetchAssignments();
  }, []); 

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch("/api/assignments"); 
      const data = await res.json();

      if (res.ok) {
        setAssignments(data.assignments);
      } else {
        // Handle specific error statuses for better user feedback
        if (res.status === 401) {
          setError("Session expired or invalid. Please log in again.");
          router.push('/login'); // Redirect to login on 401
        } else if (res.status === 403) {
          setError(data.error || "You are not authorized to view assignments. Please ensure your account is approved and assigned to a batch.");
        } else {
          setError(data.error || "Failed to fetch assignments.");
        }
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("An error occurred while loading assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionClick = (assignmentId) => {
    setCurrentAssignmentId(assignmentId);
    setSubmissionText(''); 
    setSubmissionFile(null); 
    setSubmitError('');
    setShowSubmissionForm(true);
  };

  const handleFileChange = (e) => { 
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    } else {
      setSubmissionFile(null);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');

    if (!submissionText && !submissionFile) {
      setSubmitError("Please provide either text content or upload a PDF file.");
      setSubmitLoading(false);
      return;
    }
    if (submissionFile && submissionFile.type !== 'application/pdf') {
      setSubmitError("Only PDF files are allowed for submission.");
      setSubmitLoading(false);
      return;
    }

    try {
      const formToSend = new FormData();
      formToSend.append('assignmentId', currentAssignmentId);
      if (submissionText) {
        formToSend.append('submissionContent', submissionText);
      }
      if (submissionFile) {
        formToSend.append('pdfFile', submissionFile);
      }

      const res = await fetch("/api/assignments", {
        method: "POST",
        body: formToSend,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Assignment submitted successfully!"); 
        setShowSubmissionForm(false);
        fetchAssignments(); // Re-fetch assignments to update submission status
      } else {
        // Handle specific submission errors
        if (res.status === 401) {
          setSubmitError("Session expired or invalid. Please log in again.");
          router.push('/login');
        } else if (res.status === 403) {
          setSubmitError(data.error || "You are not authorized to submit to this assignment.");
        } else if (res.status === 409) {
          setSubmitError(data.error || "You have already submitted this assignment.");
        } else {
          setSubmitError(data.error || "Failed to submit assignment.");
        }
      }
    } catch (err) {
      console.error("Error during submission:", err);
      setSubmitError("An error occurred during submission. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const assignmentDeadline = new Date(deadline);
    return now > assignmentDeadline;
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
        <div className="text-red-600 mb-4 text-center px-4">{error}</div>
        <button
          onClick={fetchAssignments}
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl mb-2">Assignments</h1>
        {assignments.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No assignments available for your batch at the moment.
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="mt-5 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded">
              <h1 className="font-semibold text-lg">{assignment.title}</h1>
              <p className="text-sm text-zinc-500 mt-1">{assignment.description}</p>

              <p className="text-xs mt-2 text-gray-400">
                Batch Code: {assignment.batchCode} {/* Display batch code for clarity */}
              </p>

              <p className={`text-xs mt-2 ${isDeadlinePassed(assignment.deadline) ? 'text-red-500' : 'text-green-600'}`}>
                Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                {isDeadlinePassed(assignment.deadline) && " (Passed)"}
              </p>

              {assignment.resourceUrl && ( 
                <p className="text-sm mt-1 mb-3"> 
                  <a 
                    href={assignment.resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    View Assignment PDF
                  </a>
                </p>
              )}

              <div className="mt-4">
                {assignment.hasSubmitted ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-blue-600 font-medium">Status: {assignment.submissionDetails?.status || 'Submitted'}</span>
                    {assignment.submissionDetails?.score !== null && assignment.submissionDetails?.status === 'Graded' && (
                      <span className="text-sm text-green-700 font-medium">Score: {assignment.submissionDetails.score}</span>
                    )}
                    {assignment.submissionDetails?.adminComments && assignment.submissionDetails?.status === 'Graded' && (
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Comments:</span> {assignment.submissionDetails.adminComments}
                      </div>
                    )}
                    {assignment.submissionDetails?.resourceUrl && ( 
                      <Link 
                        href={assignment.submissionDetails.resourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View My Submitted PDF
                      </Link>
                    )}
                  </div>
                ) : (
                  isDeadlinePassed(assignment.deadline) ? (
                    <button
                      className="text-white bg-gray-400 py-2 px-4 rounded cursor-not-allowed text-sm"
                      disabled
                    >
                      Deadline Passed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmissionClick(assignment._id)}
                      className="text-white bg-primary py-2 px-4 rounded hover:bg-primary/90 transition-colors text-sm"
                    >
                      Submit Assignment
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Submit Assignment</h2>
            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmitAssignment}>
              <label htmlFor="submissionText" className="block text-sm font-medium text-gray-700 mb-2">
                Your Submission Text (Optional)
              </label>
              <textarea
                id="submissionText"
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                rows="4"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
              ></textarea>

              <label htmlFor="submissionFile" className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                Upload PDF File (Optional)
              </label>
              <input
                type="file"
                id="submissionFile"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              {submissionFile && (
                <p className="text-sm text-gray-500 mt-1">Selected: {submissionFile.name}</p>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmissionForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
