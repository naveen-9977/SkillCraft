"use client";

import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { HiOutlineChevronDown } from "react-icons/hi2";

export default function AdminStudyMaterialsPage() {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    mentor: '',
    // resourceUrl: '', // resourceUrl will now be managed by file upload or explicitly
    resourceType: 'pdf', // Default type, can be changed
    batchCode: '',
  });
  const [resourceFile, setResourceFile] = useState(null); // NEW state for the selected file
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentResourceUrl, setCurrentResourceUrl] = useState(''); // To display existing URL when editing

  useEffect(() => {
    fetchStudyMaterials();
  }, []);

  const fetchStudyMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch("/api/admin/studymaterial");
      const data = await res.json();
      if (res.ok) {
        setStudyMaterials(data.studyMaterials);
      } else {
        setError(data.error || "Failed to fetch study materials.");
      }
    } catch (err) {
      console.error("Error fetching study materials:", err);
      setError("An error occurred while loading study materials.");
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

  // NEW: Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResourceFile(e.target.files[0]);
    } else {
      setResourceFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    // NEW: Use FormData for file uploads
    const formToSend = new FormData();
    formToSend.append('title', formData.title);
    formToSend.append('mentor', formData.mentor);
    formToSend.append('resourceType', formData.resourceType);
    formToSend.append('batchCode', formData.batchCode);

    if (resourceFile) {
      formToSend.append('resourceFile', resourceFile); // Append the actual file
    } else if (editingMaterialId && currentResourceUrl) {
      // If no new file is selected during edit, send the existing URL
      formToSend.append('resourceUrl', currentResourceUrl);
    } else {
      setError("Resource URL or a file is required.");
      setIsSaving(false);
      return;
    }

    try {
      const url = editingMaterialId
        ? `/api/admin/studymaterial` // PUT for update
        : '/api/admin/studymaterial'; // POST for create

      const method = editingMaterialId ? 'PUT' : 'POST';

      // For FormData, do NOT set 'Content-Type': 'application/json'
      // The browser will automatically set the correct 'Content-Type' header (multipart/form-data)
      const res = await fetch(url, {
        method,
        body: formToSend, // Send FormData directly
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          title: '',
          mentor: '',
          resourceType: 'pdf',
          batchCode: '',
        });
        setResourceFile(null); // Clear selected file
        setCurrentResourceUrl(''); // Clear current URL
        setEditingMaterialId(null);
        fetchStudyMaterials(); // Re-fetch to update list
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save study material.');
      }
    } catch (err) {
      console.error("Error saving study material:", err);
      setError("An error occurred while saving study material.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (material) => {
    setFormData({
      title: material.title,
      mentor: material.mentor,
      resourceType: material.resourceType,
      batchCode: material.batchCode,
    });
    setCurrentResourceUrl(material.resourceUrl); // Set existing URL for display
    setResourceFile(null); // Clear any previously selected file
    setEditingMaterialId(material._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material? This will also delete the associated file.')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/studymaterial?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchStudyMaterials(); // Re-fetch to update list
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete study material.');
      }
    } catch (err) {
      console.error("Error deleting study material:", err);
      setError("An error occurred while deleting study material.");
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
          onClick={fetchStudyMaterials}
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 h-screen py-10 px-4 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Study Material Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingMaterialId(null);
              setFormData({
                title: '',
                mentor: '',
                resourceType: 'pdf',
                batchCode: '',
              });
              setResourceFile(null); // Clear selected file on new form
              setCurrentResourceUrl(''); // Clear current URL on new form
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Material'}
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
                Mentor
              </label>
              <input
                type="text"
                name="mentor"
                value={formData.mentor}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            {/* NEW: File input for resource */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Resource File (PDF, Video, Document, etc.)
              </label>
              <input
                type="file"
                name="resourceFile"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              {resourceFile && (
                <p className="text-sm text-gray-500 mt-1">Selected: {resourceFile.name}</p>
              )}
              {editingMaterialId && !resourceFile && currentResourceUrl && (
                <p className="text-sm text-gray-500 mt-1">
                  Current file: <a href={currentResourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Current File</a>
                </p>
              )}
              {!resourceFile && !currentResourceUrl && !editingMaterialId && (
                <p className="text-sm text-red-500 mt-1">A file is required for new materials.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type
              </label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
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

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (editingMaterialId ? 'Update Material' : 'Create Material')}
            </button>
          </form>
        )}

        <div className="grid gap-6">
          {studyMaterials.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
              No study materials found. Add your first material!
            </div>
          ) : (
            studyMaterials.map((material) => (
              <div
                key={material._id}
                className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{material.title}</h2>
                  <p className="text-gray-600 text-sm mt-1">Mentor: {material.mentor}</p>
                  <p className="text-gray-600 text-sm">Type: {material.resourceType}</p>
                  <p className="text-gray-600 text-sm">Batch: {material.batchCode}</p>
                  <a
                    href={material.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 block"
                  >
                    View Resource
                  </a>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(material)}
                    className="text-primary hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(material._id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
