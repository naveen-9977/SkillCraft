"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Folder, FileText, Check, Award, Clock, FileUp, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentAssignmentsPage() {
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const [currentBatch, setCurrentBatch] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Submission Modal State
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch("/api/assignments");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch data.");
      }
      const data = await res.json();
      setBatches(data.batches || []);
      setAssignments(data.assignments || []);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isDeadlinePassed = (deadline) => deadline && new Date() > new Date(deadline);

  const { currentItems } = useMemo(() => {
    if (!currentBatch) {
      return { currentItems: batches };
    }
    const items = assignments.filter(a => a.batchCode === currentBatch.batchCode && a.parent === currentFolderId);
    return { currentItems: items.sort((a, b) => a.type === 'folder' ? -1 : 1) };
  }, [currentBatch, currentFolderId, batches, assignments]);
  
  const handleItemClick = (item) => {
    if (!currentBatch) {
        setCurrentBatch(item);
        setCurrentFolderId(null);
        setBreadcrumbs([{ id: null, name: item.batchName }]);
    } else if (item.type === 'folder') {
        setCurrentFolderId(item._id);
        setBreadcrumbs(prev => [...prev, { id: item._id, name: item.title }]);
    } else {
        const submission = submissions.find(s => s.assignment === item._id);
        setSelectedAssignment({ ...item, submissionDetails: submission || null });
        setShowSubmissionModal(true);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
        setCurrentBatch(null);
        setCurrentFolderId(null);
        setBreadcrumbs([]);
    } else {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');

    if (isDeadlinePassed(selectedAssignment.deadline)) {
        setSubmitError("The deadline for this assignment has passed.");
        setSubmitLoading(false);
        return;
    }

    if (!submissionText && !submissionFile) {
      setSubmitError("Please provide either text content or upload a PDF file.");
      setSubmitLoading(false);
      return;
    }

    try {
      const formToSend = new FormData();
      formToSend.append('assignmentId', selectedAssignment._id);
      if (submissionText) formToSend.append('submissionContent', submissionText);
      if (submissionFile) formToSend.append('pdfFile', submissionFile);

      const res = await fetch("/api/assignments", { method: "POST", body: formToSend });
      const data = await res.json();

      if (res.ok) {
        setShowSubmissionModal(false);
        fetchData();
      } else {
        setSubmitError(data.error || "Failed to submit assignment.");
      }
    } catch (err) {
      setSubmitError("An error occurred during submission.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading assignments...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center text-red-500"><p>{error}</p><button onClick={fetchData} className="mt-4 text-indigo-600">Try Again</button></div>;

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <div className="text-sm text-gray-500 breadcrumbs mt-2">
            <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:underline">Batches</span>
            {breadcrumbs.map((crumb, index) => (
              <span key={index}> / <span onClick={() => handleBreadcrumbClick(index)} className="cursor-pointer hover:underline">{crumb.name}</span></span>
            ))}
          </div>
        </header>

        <main className="bg-white p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentItems.map(item => {
              const submission = item.type === 'file' ? submissions.find(s => s.assignment === item._id) : null;
              return (
                <div key={item._id} className="relative group">
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg aspect-square cursor-pointer hover:bg-gray-50" onClick={() => handleItemClick(item)}>
                    {item.type === 'folder' || !currentBatch ? <Folder className="w-16 h-16 text-yellow-400" /> : <FileText className="w-16 h-16 text-indigo-400" />}
                    <span className="text-center text-sm mt-2 break-all">{item.batchName || item.title}</span>
                    {submission && (
                      <div className={`absolute top-2 right-2 p-1 rounded-full ${submission.status === 'Graded' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {submission.status === 'Graded' ? <Award size={14} className="text-green-600" /> : <Check size={14} className="text-blue-600" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {currentItems.length === 0 && <div className="text-center py-16 text-gray-500">This folder is empty.</div>}
        </main>
      </div>

      {showSubmissionModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-2">{selectedAssignment.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{selectedAssignment.description}</p>
            <p className={`text-sm font-semibold ${isDeadlinePassed(selectedAssignment.deadline) ? 'text-red-600' : 'text-gray-700'} mb-4`}>
                Deadline: {new Date(selectedAssignment.deadline).toLocaleString()}
            </p>
            <a href={selectedAssignment.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-2 mb-4">
                <Download size={16}/> Download Assignment PDF
            </a>
            
            {selectedAssignment.submissionDetails ? (
                <div>
                    <h3 className="font-semibold text-lg mb-2">Your Submission</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <p><strong>Status:</strong> {selectedAssignment.submissionDetails.status}</p>
                        {selectedAssignment.submissionDetails.score !== null && (
                            <p><strong>Score:</strong> {selectedAssignment.submissionDetails.score}</p>
                        )}
                        {selectedAssignment.submissionDetails.adminComments && (
                            <p><strong>Feedback:</strong> {selectedAssignment.submissionDetails.adminComments}</p>
                        )}
                         {selectedAssignment.submissionDetails.resourceUrl && (
                             <a href={selectedAssignment.submissionDetails.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-2">
                                 <FileUp size={16}/> View Your Uploaded File
                             </a>
                         )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <button onClick={() => setShowSubmissionModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
                    </div>
                </div>
            ) : isDeadlinePassed(selectedAssignment.deadline) ? (
                <>
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-semibold text-red-700">The deadline for this assignment has passed.</p>
                      <p className="text-sm text-red-600">Submissions are no longer accepted.</p>
                  </div>
                  <div className="flex justify-end mt-4">
                      <button onClick={() => setShowSubmissionModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
                  </div>
                </>
            ) : (
                <form onSubmit={handleSubmit}>
                    <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} placeholder="Type your submission..." className="w-full p-2 border rounded-md mb-4" rows="5"></textarea>
                    <input type="file" onChange={(e) => setSubmissionFile(e.target.files[0])} className="w-full p-2 border rounded-md mb-4" />
                    {submitError && <p className="text-red-500 text-sm mb-4">{submitError}</p>}
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowSubmissionModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg" disabled={submitLoading}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg" disabled={submitLoading}>
                            {submitLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}