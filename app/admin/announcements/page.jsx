"use client";

import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { HiOutlineChevronDown } from "react-icons/hi2";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    mentor: '',
    message: '',
    batchCode: '',
  });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      // Admin fetching all announcements (can add ?batchCode=X if filtering is desired)
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.announcements);
      } else {
        setError(data.error || "Failed to fetch announcements.");
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("An error occurred while loading announcements.");
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
      const url = editingAnnouncementId
        ? `/api/admin/announcements` // PUT for update
        : '/api/admin/announcements'; // POST for create

      const method = editingAnnouncementId ? 'PUT' : 'POST';

      const dataToSend = editingAnnouncementId ? { _id: editingAnnouncementId, ...formData } : formData;

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
          title: '',
          mentor: '',
          message: '',
          batchCode: '',
        });
        setEditingAnnouncementId(null);
        fetchAnnouncements(); // Re-fetch to update list
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save announcement.');
      }
    } catch (err) {
      console.error("Error saving announcement:", err);
      setError("An error occurred while saving announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      mentor: announcement.mentor,
      message: announcement.message,
      batchCode: announcement.batchCode,
    });
    setEditingAnnouncementId(announcement._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAnnouncements(); // Re-fetch to update list
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete announcement.');
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError("An error occurred while deleting announcement.");
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
          onClick={fetchAnnouncements}
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 py-10 px-4 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Announcement Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAnnouncementId(null);
              setFormData({
                title: '',
                mentor: '',
                message: '',
                batchCode: '',
              });
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Announcement'}
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
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                rows="4"
                required
              ></textarea>
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
              {isSaving ? 'Saving...' : (editingAnnouncementId ? 'Update Announcement' : 'Create Announcement')}
            </button>
          </form>
        )}

        <div className="grid gap-6">
          {announcements.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
              No announcements found. Add your first announcement!
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="bg-white p-6 rounded-lg shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold">{announcement.title}</h2>
                        <p className="text-gray-600 text-sm mt-1">by {announcement.mentor}</p>
                        <p className="text-gray-600 text-sm">Batch: {announcement.batchCode}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleEdit(announcement)}
                            className="text-primary hover:underline text-sm"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(announcement._id)}
                            className="text-red-600 hover:underline text-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <p className="mt-4 text-gray-800">{announcement.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
