"use client";

import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdOutlineVideocam } from "react-icons/md";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// Import the new CSS file
import '../styles/AdminLiveClasses.css'; // Adjust the path as necessary, e.g., '../styles/AdminLiveClasses.css'

export default function AdminLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classLink: '',
    mentor: '',
    startTime: '',
    endTime: '',
    batchCodes: [],
    isActive: true,
  });
  const [editingClassId, setEditingClassId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchLiveClassesAndBatches();
  }, []);

  const fetchLiveClassesAndBatches = async () => {
    setLoading(true);
    setError("");
    try {
      const classesRes = await fetch("/api/admin/live-classes");
      const classesData = await classesRes.json();
      if (classesRes.ok) {
        setLiveClasses(classesData.liveClasses);
      } else {
        if (classesRes.status === 401) {
          setError("Session expired. Please log in again.");
          router.push('/login');
        } else {
          setError(classesData.error || "Failed to fetch live classes.");
        }
      }

      const batchesRes = await fetch("/api/admin/batches");
      const batchesData = await batchesRes.json();
      if (batchesRes.ok) {
        setBatches(batchesData.batches);
      } else {
        if (batchesRes.status === 401) {
          setError(prev => prev + " Session expired. Please log in again.");
          router.push('/login');
        } else {
          setError(prev => prev + (batchesData.error || " Failed to fetch batches."));
        }
      }

    } catch (err) {
      console.error("Error fetching live classes or batches:", err);
      setError("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBatchCodeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      batchCodes: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const url = editingClassId
        ? `/api/admin/live-classes`
        : '/api/admin/live-classes';

      const method = editingClassId ? 'PUT' : 'POST';

      const dataToSend = { ...formData };
      if (editingClassId) {
        dataToSend._id = editingClassId;
      }

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
          description: '',
          classLink: '',
          mentor: '',
          startTime: '',
          endTime: '',
          batchCodes: [],
          isActive: true,
        });
        setEditingClassId(null);
        fetchLiveClassesAndBatches();
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          router.push('/login');
        } else {
          setError(data.error || 'Failed to save live class.');
        }
      }
    } catch (err) {
      console.error("Error saving live class:", err);
      setError("An error occurred while saving live class.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (liveClass) => {
    setFormData({
      title: liveClass.title,
      description: liveClass.description,
      classLink: liveClass.classLink,
      mentor: liveClass.mentor,
      startTime: liveClass.startTime ? format(new Date(liveClass.startTime), "yyyy-MM-dd'T'HH:mm") : '',
      endTime: liveClass.endTime ? format(new Date(liveClass.endTime), "yyyy-MM-dd'T'HH:mm") : '',
      batchCodes: liveClass.batchCodes || [],
      isActive: liveClass.isActive,
    });
    setEditingClassId(liveClass._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this live class?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/live-classes?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchLiveClassesAndBatches();
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          router.push('/login');
        } else {
          setError(data.error || 'Failed to delete live class.');
        }
      }
    } catch (err) {
      console.error("Error deleting live class:", err);
      setError("An error occurred while deleting live class.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status styling
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Live Now': return 'admin-status-live';
      case 'Upcoming': return 'admin-status-upcoming';
      case 'Ended': return 'admin-status-ended';
      case 'Inactive': return 'admin-status-inactive';
      default: return 'admin-status-default';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-spinner">
        <div></div>
      </div>
    );
  }

  if (error && !showForm) {
    return (
      <div className="admin-loading-spinner"> {/* Reusing the flex centering */}
        <div className="admin-error-message">
          {error}
          <button
            onClick={fetchLiveClassesAndBatches}
            className="admin-action-button edit" // Reusing button style
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-live-classes-page">
      <div className="admin-live-classes-container">
        <div className="admin-header">
          <h1>Live Class Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingClassId(null);
              setFormData({
                title: '',
                description: '',
                classLink: '',
                mentor: '',
                startTime: '',
                endTime: '',
                batchCodes: [],
                isActive: true,
              });
            }}
            className="admin-button-primary"
          >
            {showForm ? 'Cancel' : 'Schedule New Class'}
          </button>
        </div>

        {error && showForm && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div>
              <label>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
            <div>
              <label>
                Class Link (e.g., Google Meet, Zoom URL, or type 'internal' for built-in)
              </label>
              <input
                type="text"
                name="classLink"
                value={formData.classLink}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>
                Mentor
              </label>
              <input
                type="text"
                name="mentor"
                value={formData.mentor}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-grid">
              <div>
                <label>
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <label>
                Batches (Select multiple)
              </label>
              <select
                name="batchCodes"
                multiple
                value={formData.batchCodes}
                onChange={handleBatchCodeChange}
                required
              >
                {batches.length > 0 ? (
                  batches.map(batch => (
                    <option key={batch._id} value={batch.batchCode}>
                      {batch.batchName} ({batch.batchCode})
                    </option>
                  ))
                ) : (
                  <option disabled>No batches available</option>
                )}
              </select>
            </div>
            <div className="admin-checkbox-container">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                id="isActive"
              />
              <label htmlFor="isActive">
                Class is Active
              </label>
            </div>

            <button
              type="submit"
              className="admin-button-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (editingClassId ? 'Update Class' : 'Schedule Class')}
            </button>
          </form>
        )}

        <div className="admin-class-grid">
          {liveClasses.length === 0 ? (
            <div className="admin-no-classes">
              No live classes scheduled yet.
            </div>
          ) : (
            liveClasses.map((liveClass) => (
              <div
                key={liveClass._id}
                className="admin-class-card"
              >
                <div className="admin-class-card-header">
                    <div>
                        <h2>{liveClass.title}</h2>
                        <p>{liveClass.description}</p>
                        <p className="mentor">Mentor: {liveClass.mentor}</p>
                        <p>
                            Batches: {liveClass.batchCodes.join(', ')}
                        </p>
                        <p>
                            Start: {format(new Date(liveClass.startTime), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p>
                            End: {format(new Date(liveClass.endTime), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <span className={`admin-class-status ${getStatusClasses(liveClass.calculatedStatus)}`}>
                            {liveClass.calculatedStatus}
                        </span>
                        <a
                            href={liveClass.classLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-join-class-link"
                        >
                            <MdOutlineVideocam /> Join Class
                        </a>
                    </div>
                    <div className="admin-actions">
                        <button
                            onClick={() => handleEdit(liveClass)}
                            className="admin-action-button edit"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(liveClass._id)}
                            className="admin-action-button delete"
                        >
                            Delete
                        </button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}