"use client";

import React, { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { HiOutlineChevronDown } from "react-icons/hi2";

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    batchName: '',
    batchCreatedAt: '',
    batchCode: '',
    subjects: '',
  });
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/batches");
      const data = await res.json();
      if (res.ok) {
        setBatches(data.batches);
      } else {
        setError(data.error || "Failed to fetch batches.");
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
      setError("An error occurred while loading batches.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const url = editingBatchId
        ? `/api/admin/batches` // PUT for update
        : '/api/admin/batches'; // POST for create

      const method = editingBatchId ? 'PUT' : 'POST';

      const dataToSend = editingBatchId ? { _id: editingBatchId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          batchName: '',
          batchCreatedAt: '',
          batchCode: '',
          subjects: '',
        });
        setEditingBatchId(null);
        fetchBatches(); // Re-fetch to update list
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save batch.');
      }
    } catch (err) {
      console.error("Error saving batch:", err);
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
    if (!window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/batches?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBatches(); // Re-fetch to update list
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete batch.');
      }
    } catch (err) {
      console.error("Error deleting batch:", err);
      setError("An error occurred while deleting batch.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !showForm) { // Show global error if not in form view
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Batch Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingBatchId(null);
              setFormData({
                batchName: '',
                batchCreatedAt: '',
                batchCode: '',
                subjects: '',
              });
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Create New Batch'}
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
                Batch Name
              </label>
              <input
                type="text"
                name="batchName"
                value={formData.batchName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Created At (e.g., DD/MM/YY)
              </label>
              <input
                type="text"
                name="batchCreatedAt"
                value={formData.batchCreatedAt}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Code (Unique)
              </label>
              <input
                type="text"
                name="batchCode"
                value={formData.batchCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjects
              </label>
              <textarea
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                rows="3"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (editingBatchId ? 'Update Batch' : 'Create Batch')}
            </button>
          </form>
        )}

        <div className="grid gap-6">
          {batches.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
              No batches found. Create your first batch!
            </div>
          ) : (
            batches.map((batch) => (
              <div
                key={batch._id}
                className="bg-white p-6 rounded-lg shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-xl font-semibold">{batch.batchName}</h2>
                        <p className="text-gray-600 text-sm mt-1">Code: <span className="font-medium">{batch.batchCode}</span></p>
                        <p className="text-gray-600 text-sm">Created: {batch.batchCreatedAt}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleEdit(batch)}
                            className="text-primary hover:underline text-sm"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(batch._id)}
                            className="text-red-600 hover:underline text-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <p className="text-gray-800 mt-2">Subjects: {batch.subjects}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}