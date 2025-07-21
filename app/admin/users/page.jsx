"use client";

import React, { useState, useEffect } from "react";
import { MdDelete, MdCheckCircle, MdCancel, MdEdit, MdExpandMore } from "react-icons/md";

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]); // NEW: State to store available batches
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [render, setRender] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentBatchCodes, setCurrentBatchCodes] = useState([]); // NEW: Array for batch codes
  const [currentStatus, setCurrentStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsersAndBatches(); // Fetch both users and batches
  }, [render]);

  const fetchUsersAndBatches = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsers(usersData.users.filter(user => !user.isAdmin).map(user => ({
          ...user,
          status: user.status || 'unknown',
          batchCodes: user.batchCodes || [] // Ensure batchCodes is an array
        })));
      } else {
        setError(usersData.error || "Failed to fetch users.");
      }

      // Fetch batches
      const batchesRes = await fetch("/api/admin/batches"); // Assuming this route fetches all batches
      const batchesData = await batchesRes.json();
      if (batchesRes.ok) {
        setBatches(batchesData.batches);
      } else {
        setError(prev => prev + (batchesData.error || " Failed to fetch batches."));
      }

    } catch (err) {
      console.error("Error fetching users or batches:", err);
      setError("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setCurrentBatchCodes(user.batchCodes || []); // Set current batch codes (array)
    setCurrentStatus(user.status);
    setError('');
  };

  const handleBatchCodeChange = (e) => {
    // For multi-select, collect all selected options
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setCurrentBatchCodes(selectedOptions);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    if (currentStatus === 'approved' && currentBatchCodes.length === 0) { // NEW: Check if array is empty
        setError("At least one Batch Code is required for approved users.");
        setIsSaving(false);
        return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: editingUserId,
          status: currentStatus,
          batchCodes: currentBatchCodes, // NEW: Send array of batch codes
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEditingUserId(null);
        setRender(prev => !prev); // Trigger re-fetch
      } else {
        setError(data.error || "Failed to update user.");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      setError("An error occurred while saving user data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRender(prev => !prev); // Trigger re-fetch
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("An error occurred while deleting the user.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !editingUserId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md text-center bg-white p-6 rounded-lg shadow-md">
          <div className="text-red-500 mb-4 font-medium">{error}</div>
          <button
            onClick={() => setRender(prev => !prev)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage user accounts, status, and batch assignments
          </p>
        </div>

        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-500 text-lg">No users registered yet.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user._id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 ${
                  editingUserId === user._id ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => editingUserId === user._id ? setEditingUserId(null) : handleEditClick(user)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'approved' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(user);
                      }}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <MdEdit className="h-5 w-5" />
                    </button>
                    <MdExpandMore className={`h-5 w-5 text-gray-400 transform transition-transform ${
                      editingUserId === user._id ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>

                {editingUserId === user._id && (
                  <div className="border-t border-gray-200 p-4">
                    <form onSubmit={handleSaveUser} className="space-y-4">
                      {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <MdCancel className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-red-700">{error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`status-${user._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            id={`status-${user._id}`}
                            name="status"
                            value={currentStatus}
                            onChange={(e) => setCurrentStatus(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`batchCodes-${user._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Batch Codes (Select multiple if needed)
                          </label>
                          <select
                            id={`batchCodes-${user._id}`}
                            name="batchCodes"
                            multiple // Enable multi-select
                            value={currentBatchCodes}
                            onChange={handleBatchCodeChange}
                            className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md h-32" // Increased height
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
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                          <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                          {user.updatedAt && <p>Last Updated: {new Date(user.updatedAt).toLocaleDateString()}</p>}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user._id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            disabled={isSaving}
                          >
                            <MdDelete className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
