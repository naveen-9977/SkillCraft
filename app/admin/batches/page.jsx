"use client";

import React, { useState, useEffect } from "react";
import "./Batches.css"; // Import the new CSS file

// Using SVG directly for icons
const IconPlus = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> );
const IconEdit = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> );
const IconDelete = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> );
const IconFolder = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg> );

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    batchName: '', batchCreatedAt: '', batchCode: '', subjects: '',
  });
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        setError("");
        try {
            const [userRes, batchesRes] = await Promise.all([
                fetch("/api/auth/user"),
                fetch("/api/admin/batches")
            ]);

            const userData = await userRes.json();
            if (userRes.ok && userData.user) {
                setUser(userData.user);
            } else {
                throw new Error(userData.error || "Failed to fetch user data.");
            }

            const batchesData = await batchesRes.json();
            if (batchesRes.ok) {
                setBatches(batchesData.batches);
            } else {
                throw new Error(batchesData.error || "Failed to fetch batches.");
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("An error occurred while loading data.");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const refreshBatches = async () => {
      const res = await fetch("/api/admin/batches");
      const data = await res.json();
      if (res.ok) {
          setBatches(data.batches);
      }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
        setError("You do not have permission to perform this action.");
        return;
    }
    setIsSaving(true);
    setError('');
    try {
      const url = editingBatchId ? `/api/admin/batches` : '/api/admin/batches';
      const method = editingBatchId ? 'PUT' : 'POST';
      const dataToSend = editingBatchId ? { _id: editingBatchId, ...formData } : formData;

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ batchName: '', batchCreatedAt: '', batchCode: '', subjects: '' });
        setEditingBatchId(null);
        await refreshBatches();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save batch.');
      }
    } catch (err) {
      setError("An error occurred while saving batch.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (batch) => {
    setFormData({
      batchName: batch.batchName,
      batchCreatedAt: batch.batchCreatedAt,
      batchCode: batch.batchCode,
      subjects: batch.subjects,
    });
    setEditingBatchId(batch._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'admin') {
        setError("You do not have permission to perform this action.");
        return;
    }
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    
    try {
      const res = await fetch(`/api/admin/batches?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshBatches();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete batch.');
      }
    } catch (err) {
      setError("An error occurred while deleting batch.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Batch Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                    {user?.role === 'admin' ? 'Create, view, and manage all course batches.' : 'Viewing batches you are assigned to.'}
                </p>
            </div>
            {user && user.role === 'admin' && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingBatchId(null);
                setFormData({ batchName: '', batchCreatedAt: '', batchCode: '', subjects: '' });
              }}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <IconPlus />
              {showForm ? 'Cancel' : 'Create New Batch'}
            </button>
          )}
        </header>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">{error}</div>}

        {showForm && user && user.role === 'admin' && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">{editingBatchId ? 'Edit Batch' : 'Create a New Batch'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                    <input name="batchName" value={formData.batchName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Creation Date</label>
                    <input name="batchCreatedAt" value={formData.batchCreatedAt} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required placeholder="e.g., DD/MM/YYYY"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code (Unique)</label>
                    <input name="batchCode" value={formData.batchCode} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated)</label>
                    <textarea name="subjects" value={formData.subjects} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" rows="3" required></textarea>
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-sm" disabled={isSaving}>
                      {isSaving ? 'Saving...' : (editingBatchId ? 'Update Batch' : 'Create Batch')}
                    </button>
                </div>
              </form>
          </div>
        )}

        <main>
            {batches.length === 0 ? (
                <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">No Batches Found</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                    <div key={batch._id} className="batch-card">
                        <div className="batch-card-header">
                            <IconFolder />
                            <h2 className="batch-card-title">{batch.batchName}</h2>
                            {user && user.role === 'admin' && (
                                <div className="batch-card-actions">
                                    <button onClick={() => handleEdit(batch)} className="action-btn edit-btn"><IconEdit /></button>
                                    <button onClick={() => handleDelete(batch._id)} className="action-btn delete-btn"><IconDelete /></button>
                                </div>
                            )}
                        </div>
                        {user && user.role === 'admin' && (
                            <p className="batch-card-date">Created: {batch.batchCreatedAt}</p>
                        )}
                        <p className="batch-card-subjects">
                            <span>Subjects:</span> {batch.subjects}
                        </p>
                    </div>
                ))}
                </div>
            )}
        </main>
      </div>
    </div>
  );
}