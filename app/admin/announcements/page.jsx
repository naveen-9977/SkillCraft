"use client";

import React, { useEffect, useState } from "react";
import '../styles/AdminAnnouncements.css'; // New CSS file for styling

// Icons for the UI
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
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
    fetchAnnouncementsAndBatches();
  }, []);

  const fetchAnnouncementsAndBatches = async () => {
    setLoading(true);
    setError('');
    try {
      const [announcementsRes, batchesRes] = await Promise.all([
        fetch("/api/admin/announcements"),
        fetch("/api/admin/batches")
      ]);
      
      const announcementsData = await announcementsRes.json();
      if (announcementsRes.ok) {
        setAnnouncements(announcementsData.announcements);
      } else {
        setError(announcementsData.error || "Failed to fetch announcements.");
      }

      const batchesData = await batchesRes.json();
      if (batchesRes.ok) {
        setBatches(batchesData.batches);
      } else {
        setError(prev => prev + (batchesData.error || " Failed to fetch batches."));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const url = editingAnnouncementId ? `/api/admin/announcements` : '/api/admin/announcements';
      const method = editingAnnouncementId ? 'PUT' : 'POST';
      const dataToSend = editingAnnouncementId ? { _id: editingAnnouncementId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ title: '', mentor: '', message: '', batchCode: '' });
        setEditingAnnouncementId(null);
        await fetchAnnouncementsAndBatches();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save announcement.');
      }
    } catch (err) {
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
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAnnouncementsAndBatches();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete announcement.');
      }
    } catch (err) {
      setError("An error occurred while deleting announcement.");
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loader"></div></div>;
  }

  return (
    <div className="admin-announcements-container">
      <header className="announcements-header">
        <div>
          <h1 className="announcements-title">Announcements</h1>
          <p className="announcements-subtitle">Create and manage announcements for batches.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingAnnouncementId(null); setFormData({ title: '', mentor: '', message: '', batchCode: '' }); }} className="create-announcement-btn">
          <IconPlus />
          New Announcement
        </button>
      </header>

      {error && !showForm && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingAnnouncementId ? 'Edit Announcement' : 'Create New Announcement'}</h2>
              <button onClick={() => setShowForm(false)} className="close-btn"><IconX /></button>
            </div>
            {error && showForm && <div className="error-message modal-error">{error}</div>}
            <form onSubmit={handleSubmit} className="announcement-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Mentor</label>
                <input type="text" name="mentor" value={formData.mentor} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Batch</label>
                <select name="batchCode" value={formData.batchCode} onChange={handleInputChange} required>
                  <option value="">Select a batch</option>
                  {batches.map(batch => (
                    <option key={batch._id} value={batch.batchCode}>{batch.batchName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Message</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={4}></textarea>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : (editingAnnouncementId ? 'Update Announcement' : 'Create Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="announcements-grid">
        {announcements.length > 0 ? announcements.map(announcement => (
          <div key={announcement._id} className="announcement-card">
            <div className="card-header">
              <h2 className="card-title">{announcement.title}</h2>
              <div className="card-actions">
                <button onClick={() => handleEdit(announcement)} className="action-btn" title="Edit"><IconEdit /></button>
                <button onClick={() => handleDelete(announcement._id)} className="action-btn delete" title="Delete"><IconDelete /></button>
              </div>
            </div>
            <p className="card-message">{announcement.message}</p>
            <div className="card-footer">
              <span className="mentor-info">by {announcement.mentor}</span>
              <span className="batch-tag">{announcement.batchName}</span>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <h3>No Announcements Found</h3>
            <p>Click "New Announcement" to create one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
