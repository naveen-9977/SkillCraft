"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FiUsers, FiUserCheck, FiUserPlus, FiSearch, FiEdit, FiTrash2, FiSave, FiX, FiAlertTriangle } from 'react-icons/fi';
import './AdminUserManagement.css'; // Using the new CSS file

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBatchCodes, setCurrentBatchCodes] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsersAndBatches();
  }, []);

  const fetchUsersAndBatches = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, batchesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/batches")
      ]);

      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsers(usersData.users.filter(user => user.role !== 'admin'));
      } else {
        setError(usersData.error || "Failed to fetch users.");
      }

      const batchesData = await batchesRes.json();
      if (batchesRes.ok) {
        setBatches(batchesData.batches);
      } else {
        setError(prev => prev + (batchesData.error || " Failed to fetch batches."));
      }

    } catch (err) {
      setError("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setCurrentBatchCodes(user.batchCodes || []);
    setCurrentStatus(user.status);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError('');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    if (currentStatus === 'approved' && currentBatchCodes.length === 0) {
        setError("At least one Batch is required for approved users.");
        setIsSaving(false);
        return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser._id,
          status: currentStatus,
          batchCodes: currentBatchCodes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        handleCloseModal();
        await fetchUsersAndBatches();
      } else {
        setError(data.error || "Failed to update user.");
      }
    } catch (err) {
      setError("An error occurred while saving user data.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteConfirm = (user) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setUserToDelete(null);
    setIsConfirmModalOpen(false);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete._id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchUsersAndBatches();
        closeDeleteConfirm();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete user.");
      }
    } catch (err) {
      setError("An error occurred while deleting the user.");
    } finally {
        setIsSaving(false);
    }
  };

  const batchCodeToNameMap = useMemo(() => {
    return batches.reduce((acc, batch) => {
      acc[batch.batchCode] = batch.batchName;
      return acc;
    }, {});
  }, [batches]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
        const matchesFilter = filter === 'all' || user.role === filter;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });
  }, [users, filter, searchTerm]);

  const stats = useMemo(() => ({
      students: users.filter(u => u.role === 'student').length,
      mentors: users.filter(u => u.role === 'mentor').length,
      pending: users.filter(u => u.status === 'pending').length,
  }), [users]);

  if (loading) {
    return (
      <div className="loading-container">
          <div className="loader"></div>
          <p>Loading User Data...</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Approve, manage, and assign batches to students and mentors.
          </p>
        </div>
        <div className="header-stats">
            <div className="stat-card"><FiUserCheck className="stat-icon students" /><span className="stat-value">{stats.students}</span><span className="stat-label">Students</span></div>
            <div className="stat-card"><FiUsers className="stat-icon mentors" /><span className="stat-value">{stats.mentors}</span><span className="stat-label">Mentors</span></div>
            <div className="stat-card"><FiUserPlus className="stat-icon pending" /><span className="stat-value">{stats.pending}</span><span className="stat-label">Pending</span></div>
        </div>
      </header>
      
      <div className="controls-container">
        <div className="filter-tabs">
            <button onClick={() => setFilter('all')} className={`filter-tab ${filter === 'all' ? 'active' : ''}`}>All</button>
            <button onClick={() => setFilter('student')} className={`filter-tab ${filter === 'student' ? 'active' : ''}`}>Students</button>
            <button onClick={() => setFilter('mentor')} className={`filter-tab ${filter === 'mentor' ? 'active' : ''}`}>Mentors</button>
        </div>
        <div className="search-container">
            <div className="search-input">
                <FiSearch className="search-icon" />
                <input 
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="datatable-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Batches</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-content">
                    <FiUsers className="empty-icon" />
                    <h3>No Users Found</h3>
                    <p>No users match your current filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                        <div className="user-avatar" style={{backgroundColor: `hsl(${user.name.charCodeAt(0) * 2 % 360}, 60%, 70%)`}}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                    </div>
                  </td>
                  <td><span className={`role-pill ${user.role}`}>{user.role}</span></td>
                  <td><span className={`status-pill ${user.status}`}>{user.status}</span></td>
                  <td>
                    <div className="batch-tags">
                        {user.batchCodes && user.batchCodes.length > 0 ? 
                            user.batchCodes.map(code => (
                                <span key={code} className="batch-tag">{batchCodeToNameMap[code] || code}</span>
                            )) : 
                            <span className="no-batches">-</span>
                        }
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                        <button onClick={() => handleEditClick(user)} className="action-btn edit-btn" title="Edit User"><FiEdit /></button>
                        <button onClick={() => openDeleteConfirm(user)} className="action-btn delete-btn" title="Delete User"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingUser && (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Edit: {editingUser.name}</h2>
                    <button onClick={handleCloseModal} className="close-btn"><FiX/></button>
                </div>
                <form onSubmit={handleSaveUser} className="modal-body">
                    {error && <div className="modal-error">{error}</div>}
                    <div className="form-group">
                        <label>Status</label>
                        <div className="status-options">
                            <div onClick={() => setCurrentStatus('pending')} className={`status-option ${currentStatus === 'pending' ? 'active' : ''}`}>Pending</div>
                            <div onClick={() => setCurrentStatus('approved')} className={`status-option ${currentStatus === 'approved' ? 'active' : ''}`}>Approved</div>
                            <div onClick={() => setCurrentStatus('rejected')} className={`status-option ${currentStatus === 'rejected' ? 'active' : ''}`}>Rejected</div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Assigned Batches</label>
                        <div className="batch-select-container">
                            <select 
                                multiple 
                                value={currentBatchCodes} 
                                onChange={(e) => setCurrentBatchCodes(Array.from(e.target.selectedOptions, option => option.value))}
                                className="batch-select"
                            >
                                {batches.map(batch => (
                                    <option key={batch._id} value={batch.batchCode}>
                                        {batch.batchName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={handleCloseModal} className="cancel-btn" disabled={isSaving}>
                            <FiX /> Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={isSaving}>
                            {isSaving ? <span className="spinner"></span> : <><FiSave /> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {isConfirmModalOpen && userToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content confirmation-modal">
            <div className="confirmation-content">
                <div className="warning-icon"><FiAlertTriangle /></div>
                <h2 className="modal-title">Confirm Deletion</h2>
                <p className="confirmation-text">
                    Delete <strong>{userToDelete.name}</strong>? This is permanent.
                </p>
            </div>
            <div className="modal-footer">
                <button onClick={closeDeleteConfirm} className="cancel-btn">Cancel</button>
                <button onClick={handleDeleteUser} className="delete-confirm-btn" disabled={isSaving}>
                    {isSaving ? <span className="spinner"></span> : 'Delete'}
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}