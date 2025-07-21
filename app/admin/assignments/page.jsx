"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; 
import { MdDelete } from "react-icons/md"; 

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    batchCode: '', // NEW: Add batchCode to formData state
  });
  const [pdfFile, setPdfFile] = useState(null); 
  const [editingAssignmentId, setEditingAssignmentId] = useState(null); 

  useEffect(() => {
    fetchAssignments();
  }, []); 

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      // Admin fetching all assignments (can add ?batchCode=X if filtering is desired)
      const res = await fetch("/api/admin/assignments"); 
      const data = await res.json();
      if (res.ok) {
        setAssignments(data.assignments);
      } else {
        setError(data.error || "Failed to fetch assignments.");
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("An error occurred while loading assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => { 
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    } else {
      setPdfFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // The current backend PUT method for assignments only supports updating submission scores.
      // To update assignment details (title, description, deadline, batchCode),
      // you would typically need a separate PUT route like /api/admin/assignments/[id]/route.js.
      // For now, this form only supports creating new assignments.
      const apiEndpoint = '/api/admin/assignments'; // POST only for creating
      const method = 'POST'; // Always POST for new creation here

      const formToSend = new FormData();
      formToSend.append('title', formData.title);
      formToSend.append('description', formData.description);
      if (formData.deadline) {
        formToSend.append('deadline', new Date(formData.deadline).toISOString());
      }
      formToSend.append('batchCode', formData.batchCode); // NEW: Append batchCode
      if (pdfFile) {
        formToSend.append('pdfFile', pdfFile); 
      } 

      const res = await fetch(apiEndpoint, {
        method,
        body: formToSend,
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ title: '', description: '', deadline: '', batchCode: '' }); // Reset batchCode
        setPdfFile(null); 
        setEditingAssignmentId(null);
        fetchAssignments(); 
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save assignment');
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
      setError('Error saving assignment. Check server logs.');
    } finally {
      setLoading(false);
    }
  };

  // NOTE: Admin Assignment Editing (PUT) for title/description/deadline/batchCode
  // is not fully implemented in the backend (app/api/admin/assignments/route.js only handles POST/GET/DELETE,
  // while app/api/admin/assignments/[id]/submissions/route.js handles PUT for submissions).
  // If full editing functionality for assignment details is needed, a PUT method would be added
  // to app/api/admin/assignments/[id]/route.js.
  const handleEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline ? assignment.deadline.substring(0, 10) : '',
      batchCode: assignment.batchCode || '', // Populate batchCode for edit
    });
    setPdfFile(null); 
    setEditingAssignmentId(assignment._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This will also delete all student submissions and the associated PDF file.')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/assignments?id=${id}`, { 
        method: 'DELETE'
      });

      if (res.ok) {
        fetchAssignments();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setError('Error deleting assignment.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !showForm) { // Only show global error if not in form view
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-red-600 mb-4">{error}</div>
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Assignment Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAssignmentId(null);
              setFormData({ title: '', description: '', deadline: '', batchCode: '' }); // Reset batchCode
              setPdfFile(null); 
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Create New Assignment'}
          </button>
        </div>

        {error && showForm && ( // Show form-specific error
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Code
              </label>
              <input
                type="text"
                name="batchCode"
                value={formData.batchCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
                placeholder="e.g., BATCH-2025-A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Assignment PDF (Optional)
              </label>
              <input
                type="file"
                name="pdfFile"
                accept=".pdf" 
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              {editingAssignmentId && !pdfFile && (
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to keep current file.
                  {formData.resourceUrl && ( // Assuming resourceUrl exists on formData when editing
                    <a href={formData.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                      (Current: View File)
                    </a>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingAssignmentId ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </form>
        )}

        <div className="grid gap-6">
          {assignments.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
              No assignments found. Create your first assignment!
            </div>
          ) : (
            assignments.map(assignment => (
              <div 
                key={assignment._id} 
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-2">{assignment.title}</h2>
                <p className="text-gray-600 mb-3">{assignment.description}</p>
                {assignment.resourceUrl && ( 
                  <p className="text-sm mb-3">
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
                <p className="text-sm text-gray-500">
                  Deadline: {formatDate(assignment.deadline)}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Batch Code: <span className="font-medium">{assignment.batchCode}</span> {/* NEW: Display batchCode */}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Submissions: <span className="font-medium">{assignment.submissionCount}</span>
                </p>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="text-primary hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <Link 
                    href={`/admin/assignments/${assignment._id}/submissions`}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Submissions
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
);
}
