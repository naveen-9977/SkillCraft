"use client";

import React, { useState } from "react";
import Link from "next/link"; 

export default function AssignmentsClientPage({ initialAssignments, user }) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', deadline: '', batchCode: '',
  });
  const [pdfFile, setPdfFile] = useState(null); 
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshAssignments = async () => {
    const res = await fetch("/api/admin/assignments");
    const data = await res.json();
    if (res.ok) {
        setAssignments(data.assignments);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setIsSaving(true);
    setError('');

    try {
      // Logic for submitting forms remains the same
      const apiEndpoint = editingAssignmentId ? `/api/admin/assignments/${editingAssignmentId}` : '/api/admin/assignments';
      const method = editingAssignmentId ? 'PUT' : 'POST';

      const formToSend = new FormData();
      formToSend.append('title', formData.title);
      formToSend.append('description', formData.description);
      if (formData.deadline) {
        formToSend.append('deadline', new Date(formData.deadline).toISOString());
      }
      formToSend.append('batchCode', formData.batchCode);
      if (pdfFile) {
        formToSend.append('pdfFile', pdfFile); 
      }
      if(editingAssignmentId) {
        formToSend.append('_id', editingAssignmentId);
      }

      const res = await fetch(apiEndpoint, { method, body: formToSend });

      if (res.ok) {
        setShowForm(false);
        setFormData({ title: '', description: '', deadline: '', batchCode: '' });
        setPdfFile(null); 
        setEditingAssignmentId(null);
        await refreshAssignments(); 
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save assignment');
      }
    } catch (error) {
      setError('Error saving assignment. Check server logs.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline ? assignment.deadline.substring(0, 10) : '',
      batchCode: assignment.batchCode || '',
    });
    setPdfFile(null); 
    setEditingAssignmentId(assignment._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment? This will also delete all submissions.')) return;

    try {
      const res = await fetch(`/api/admin/assignments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshAssignments();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete assignment');
      }
    } catch (error) {
      setError('Error deleting assignment.');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Assignment Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAssignmentId(null);
              setFormData({ title: '', description: '', deadline: '', batchCode: '' });
              setPdfFile(null); 
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            {showForm ? 'Cancel' : 'Create New Assignment'}
          </button>
        </header>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border rounded-md" required placeholder="Title"/>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded-md" required rows={3} placeholder="Description"/>
            <input type="text" name="batchCode" value={formData.batchCode} onChange={handleInputChange} className="w-full p-2 border rounded-md" required placeholder="Batch Code"/>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full p-2 border rounded-md" required />
            <input type="file" name="pdfFile" accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded-md"/>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-md" disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingAssignmentId ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </form>
        )}

        <main className="grid gap-6">
          {assignments.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
              No assignments found.
            </div>
          ) : (
            assignments.map(assignment => (
              <div key={assignment._id} className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold">{assignment.title}</h2>
                <p className="text-gray-600 mt-1">{assignment.description}</p>
                <div className="text-sm text-gray-500 mt-3">
                  <span>Deadline: {formatDate(assignment.deadline)}</span>
                  <span className="mx-2">·</span>
                  <span>Batch: {assignment.batchCode}</span>
                  <span className="mx-2">·</span>
                  <span>Submissions: {assignment.submissionCount}</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-4">
                    {(user.role === 'admin' || (user.role === 'mentor' && user._id === assignment.createdBy)) && (
                      <>
                        <button onClick={() => handleEdit(assignment)} className="text-primary hover:underline text-sm">Edit</button>
                        <button onClick={() => handleDelete(assignment._id)} className="text-red-600 hover:underline text-sm">Delete</button>
                      </>
                    )}
                  </div>
                  <Link href={`/admin/assignments/${assignment._id}/submissions`} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                    View Submissions
                  </Link>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}