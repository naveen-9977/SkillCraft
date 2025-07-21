"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaGraduationCap } from "react-icons/fa"; 

export default function AdminAssignmentSubmissionsPage({ params }) {
  const router = useRouter();
  
  // FIX 1: Use React.use(params) to unwrap params
  const resolvedParams = React.use(params);
  const assignmentId = resolvedParams.id; 

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // State for fetching/saving errors
  const [editingSubmissionId, setEditingSubmissionId] = useState(null);
  const [currentScore, setCurrentScore] = useState('');
  const [currentComments, setCurrentComments] = useState('');
  const [savingSubmission, setSavingSubmission] = useState(false); // State for saving grade process

  useEffect(() => {
    // Only fetch submissions if assignmentId is valid
    if (assignmentId) {
      fetchSubmissions();
    } else {
      setError("Assignment ID not provided.");
      setLoading(false);
    }
  }, [assignmentId]); // Dependency array ensures this runs when assignmentId changes

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(""); // Clear any previous errors before fetching
    try {
      const res = await fetch(`/api/admin/assignments/${assignmentId}/submissions`);
      const data = await res.json();

      if (res.ok) {
        setAssignment(data.assignment);
        setSubmissions(data.submissions);
      } else {
        setError(data.error || "Failed to fetch submissions.");
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("An error occurred while loading submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submission) => {
    setEditingSubmissionId(submission._id);
    setCurrentScore(submission.score !== null ? submission.score.toString() : '');
    setCurrentComments(submission.adminComments || '');
    setError(''); // Clear any previous submission save errors when starting to grade
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setSavingSubmission(true);
    setError(""); // Clear any previous errors before saving

    if (!currentScore || isNaN(currentScore) || Number(currentScore) < 0) {
      setError("Please enter a valid score (non-negative number).");
      setSavingSubmission(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/assignments/${assignmentId}/submissions`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId: editingSubmissionId,
          score: Number(currentScore),
          adminComments: currentComments,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Submission graded successfully!");
        setEditingSubmissionId(null); // Exit editing mode
        fetchSubmissions(); // Re-fetch submissions to show updated grades
      } else {
        setError(data.error || "Failed to save grade.");
      }
    } catch (err) {
      console.error("Error saving grade:", err);
      setError("An error occurred while saving the grade.");
    } finally {
      setSavingSubmission(false);
    }
  };

  // Rendering conditional logic:
  // These `if` blocks are standard and only return JSX, not call setState in render.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !loading) { // Only show global error if not loading
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push('/admin/assignments')}
          className="text-primary hover:underline mt-4"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  if (!assignment && !loading) { // Only show "not found" if not loading
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-gray-600 mb-4">Assignment not found.</div>
        <button
          onClick={() => router.push('/admin/assignments')}
          className="text-primary hover:underline mt-4"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Submissions for: "{assignment.title}"</h1>
          <button
            onClick={() => router.push('/admin/assignments')}
            className="text-primary hover:underline"
          >
            &larr; Back to Assignments
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
            No submissions yet for this assignment.
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <div 
                key={submission._id} 
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Student: {submission.student ? submission.student.name : "Unknown Student"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Email: {submission.student ? submission.student.email : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {submission.status === 'Graded' ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <FaGraduationCap size={20} /> Graded
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGradeClick(submission)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      Grade
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-700">Submission Content:</h3>
                  <p className="text-gray-800 break-words whitespace-pre-wrap">{submission.submissionContent}</p>
                  {submission.resourceUrl && (
                    <p className="mt-2 text-sm">
                      <a 
                        href={submission.resourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        View Submitted PDF
                      </a>
                    </p>
                  )}
                </div>

                {submission.status === 'Graded' && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-lg font-semibold text-gray-800">Score: {submission.score}</p>
                    <p className="text-gray-700 mt-1">Comments: {submission.adminComments || "No comments."}</p>
                  </div>
                )}

                {editingSubmissionId === submission._id && (
                  <form onSubmit={handleSaveGrade} className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold">Grade Submission</h3>
                    <div>
                      <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">Score:</label>
                      <input
                        type="number"
                        id="score"
                        value={currentScore}
                        onChange={(e) => setCurrentScore(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Comments:</label>
                      <textarea
                        id="comments"
                        value={currentComments}
                        onChange={(e) => setCurrentComments(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                        rows="4"
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingSubmissionId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={savingSubmission}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                        disabled={savingSubmission}
                      >
                        {savingSubmission ? 'Saving...' : 'Save Grade'}
                      </button>
                    </div>
                    {/* Display error specific to grading form */}
                    {error && editingSubmissionId === submission._id && (
                        <div className="text-red-600 text-sm mt-2">{error}</div>
                    )}
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}