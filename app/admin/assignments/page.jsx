"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Folder, FileText, Upload, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminAssignmentsPage() {
    const [user, setUser] = useState(null);
    const [batches, setBatches] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const [currentBatch, setCurrentBatch] = useState(null);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newAssignmentData, setNewAssignmentData] = useState({ title: '', description: '', deadline: '', file: null });

    useEffect(() => {
        fetchData();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/user');
            const data = await res.json();
            if (res.ok) setUser(data.user);
        } catch (e) {
            console.error("Failed to fetch user", e);
        }
    };

    // CORRECTED: Added the 'async' keyword here
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch("/api/admin/assignments");
            const data = await res.json();
            if (res.ok) {
                setBatches(data.batches);
                setAssignments(data.assignments);
            } else {
                setError(data.error || "Failed to fetch data.");
            }
        } catch (err) {
            setError("An error occurred while loading data.");
        } finally {
            setLoading(false);
        }
    };
    
    const { currentItems } = useMemo(() => {
        if (!currentBatch) {
            return { currentItems: batches };
        }
        const items = assignments.filter(a => a.batchCode === currentBatch.batchCode && a.parent === currentFolderId);
        return { currentItems: items.sort((a, b) => a.type === 'folder' ? -1 : 1) };
    }, [currentBatch, currentFolderId, batches, assignments]);

    const handleItemClick = (item) => {
        if (!currentBatch) {
            setCurrentBatch(item);
            setCurrentFolderId(null);
            setBreadcrumbs([{ id: null, name: item.batchName }]);
        } else if (item.type === 'folder') {
            setCurrentFolderId(item._id);
            setBreadcrumbs(prev => [...prev, { id: item._id, name: item.title }]);
        } else {
            router.push(`/admin/assignments/${item._id}/submissions`);
        }
    };
    
    const handleBreadcrumbClick = (index) => {
        if (index === -1) {
            setCurrentBatch(null);
            setCurrentFolderId(null);
            setBreadcrumbs([]);
        } else {
            const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
            setBreadcrumbs(newBreadcrumbs);
            setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName) return;
        try {
            const formData = new FormData();
            formData.append('type', 'folder');
            formData.append('title', newFolderName);
            formData.append('batchCode', currentBatch.batchCode);
            if (currentFolderId) formData.append('parent', currentFolderId);

            const res = await fetch('/api/admin/assignments', { method: 'POST', body: formData });
            if (res.ok) {
                setShowCreateFolderModal(false);
                setNewFolderName('');
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create folder');
            }
        } catch (e) {
            alert('An error occurred.');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.title}"? This will also delete all its contents and submissions.`)) return;
        try {
            const res = await fetch(`/api/admin/assignments?id=${item._id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete.');
            }
        } catch (e) {
            alert('An error occurred.');
        }
    };

    const handleUploadAssignment = async () => {
        if (!newAssignmentData.title || !newAssignmentData.description || !newAssignmentData.deadline || !newAssignmentData.file) {
            alert("All fields are required.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('type', 'file');
            formData.append('title', newAssignmentData.title);
            formData.append('description', newAssignmentData.description);
            formData.append('deadline', newAssignmentData.deadline);
            formData.append('batchCode', currentBatch.batchCode);
            if (currentFolderId) formData.append('parent', currentFolderId);
            formData.append('pdfFile', newAssignmentData.file);

            const res = await fetch('/api/admin/assignments', { method: 'POST', body: formData });
            if (res.ok) {
                setShowUploadModal(false);
                setNewAssignmentData({ title: '', description: '', deadline: '', file: null });
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to upload assignment');
            }
        } catch (e) {
            alert('An error occurred.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="bg-zinc-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
                        <div className="text-sm text-gray-500 breadcrumbs mt-2">
                            <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:underline">Batches</span>
                            {breadcrumbs.map((crumb, index) => (
                                <span key={index}> / <span onClick={() => handleBreadcrumbClick(index)} className="cursor-pointer hover:underline">{crumb.name}</span></span>
                            ))}
                        </div>
                    </div>
                    {currentBatch && (
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <button onClick={() => setShowCreateFolderModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                                <Folder size={16} /> Create Folder
                            </button>
                            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                                <Upload size={16} /> New Assignment
                            </button>
                        </div>
                    )}
                </header>

                <main className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {currentItems.map(item => (
                            <div key={item._id} className="relative group">
                                <div
                                    className="flex flex-col items-center justify-center p-4 border rounded-lg aspect-square cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleItemClick(item)}
                                >
                                    {item.type === 'folder' || !currentBatch ? <Folder className="w-16 h-16 text-yellow-400" /> : <FileText className="w-16 h-16 text-indigo-400" />}
                                    <span className="text-center text-sm mt-2 break-all">{item.batchName || item.title}</span>
                                </div>
                                {currentBatch && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                                        <button onClick={() => handleDelete(item)} className="p-1.5 bg-white rounded-full shadow hover:bg-red-50">
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {currentItems.length === 0 && <div className="text-center py-16 text-gray-500">This folder is empty.</div>}
                </main>
            </div>

            {showCreateFolderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
                        <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder Name" className="w-full p-2 border rounded-md mb-4" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowCreateFolderModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleCreateFolder} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Create</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">New Assignment</h3>
                        <div className="space-y-4">
                            <input type="text" value={newAssignmentData.title} onChange={e => setNewAssignmentData(p => ({ ...p, title: e.target.value }))} placeholder="Assignment Title" className="w-full p-2 border rounded-md" />
                            <textarea value={newAssignmentData.description} onChange={e => setNewAssignmentData(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full p-2 border rounded-md" rows="3"></textarea>
                            <input type="date" value={newAssignmentData.deadline} onChange={e => setNewAssignmentData(p => ({ ...p, deadline: e.target.value }))} className="w-full p-2 border rounded-md" />
                            <input type="file" onChange={e => setNewAssignmentData(p => ({ ...p, file: e.target.files[0] }))} className="w-full p-2 border rounded-md" />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleUploadAssignment} className="px-4 py-2 bg-green-500 text-white rounded-lg">Upload</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}