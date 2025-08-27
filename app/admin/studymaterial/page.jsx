"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Folder, File, Upload, Plus, Trash2, ArrowLeft, MoreVertical, Edit, Video, Image as ImageIcon } from 'lucide-react';

export default function AdminStudyMaterialsPage() {
  const [user, setUser] = useState(null);
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation state
  const [currentBatch, setCurrentBatch] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Modal states
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFile, setNewFile] = useState(null);
  
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

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch("/api/admin/studymaterial");
      const data = await res.json();
      if (res.ok) {
        setBatches(data.batches);
        setMaterials(data.materials);
      } else {
        setError(data.error || "Failed to fetch data.");
      }
    } catch (err) {
      setError("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (url) => {
    if (!url) return null;
    try {
        const urlParts = new URL(url, window.location.origin).pathname.split('.');
        return urlParts.length > 1 ? urlParts.pop().toUpperCase() : null;
    } catch (e) {
        return null;
    }
  };

  const FileTypeIcon = ({ url }) => {
    const extension = getFileExtension(url);
    switch (extension) {
        case 'MP4': case 'MOV': return <Video className="w-16 h-16 text-red-400" />;
        case 'JPG': case 'JPEG': case 'PNG': case 'GIF': return <ImageIcon className="w-16 h-16 text-green-400" />;
        case 'PDF': return <File className="w-16 h-16 text-purple-400" />;
        default: return <File className="w-16 h-16 text-gray-400" />;
    }
  };

  const { currentItems, currentPathName } = useMemo(() => {
    if (!currentBatch) {
      return { currentItems: batches, currentPathName: 'All Batches' };
    }
    const items = materials.filter(m => m.batchCode === currentBatch.batchCode && m.parent === currentFolderId);
    const currentFolder = currentFolderId ? materials.find(m => m._id === currentFolderId) : null;
    return {
        currentItems: items.sort((a, b) => a.type === 'folder' ? -1 : 1),
        currentPathName: currentFolder ? currentFolder.title : currentBatch.batchName
    };
  }, [currentBatch, currentFolderId, batches, materials]);

  const handleBatchClick = (batch) => {
    setCurrentBatch(batch);
    setCurrentFolderId(null);
    setBreadcrumbs([{ id: null, name: batch.batchName }]);
  };

  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder._id);
    setBreadcrumbs(prev => [...prev, { id: folder._id, name: folder.title }]);
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

        const res = await fetch('/api/admin/studymaterial', { method: 'POST', body: formData });
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

  const handleUploadFile = async () => {
    if (!newFile) return;
    try {
        const formData = new FormData();
        formData.append('type', 'file');
        formData.append('title', newFileName || newFile.name);
        formData.append('batchCode', currentBatch.batchCode);
        if (currentFolderId) formData.append('parent', currentFolderId);
        formData.append('resourceFile', newFile);

        const res = await fetch('/api/admin/studymaterial', { method: 'POST', body: formData });
        if (res.ok) {
            setShowUploadFileModal(false);
            setNewFileName('');
            setNewFile(null);
            fetchData();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to upload file');
        }
    } catch (e) {
        alert('An error occurred.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"? This will also delete all its contents.`)) return;
    try {
        const res = await fetch(`/api/admin/studymaterial?id=${item._id}`, { method: 'DELETE' });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Study Material</h1>
            <div className="text-sm text-gray-500 breadcrumbs mt-2">
                <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:underline">Batches</span>
                {breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                        <span className="mx-2">/</span>
                        <span onClick={() => handleBreadcrumbClick(index)} className="cursor-pointer hover:underline">{crumb.name}</span>
                    </span>
                ))}
            </div>
          </div>
          {currentBatch && (
            <div className="flex gap-2 mt-4 sm:mt-0">
                <button onClick={() => setShowCreateFolderModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                    <Folder size={16} /> Create Folder
                </button>
                <button onClick={() => setShowUploadFileModal(true)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                    <Upload size={16} /> Upload File
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
                    onClick={() => item.type === 'folder' || !currentBatch ? (item.batchName ? handleBatchClick(item) : handleFolderClick(item)) : window.open(item.resourceUrl, '_blank')}
                >
                    {item.type === 'folder' || !currentBatch ? <Folder className="w-16 h-16 text-blue-400" /> : <FileTypeIcon url={item.resourceUrl} />}
                    <span className="text-center text-sm mt-2 break-all">{item.batchName || item.title}</span>
                    {item.type === 'file' && <span className="text-xs text-gray-400">{getFileExtension(item.resourceUrl)}</span>}
                </div>
                {currentBatch && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => handleDelete(item)} className="p-1.5 bg-white rounded-full shadow hover:bg-red-50">
                            <Trash2 size={16} className="text-red-500"/>
                        </button>
                    </div>
                )}
              </div>
            ))}
          </div>
          {currentItems.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                This folder is empty.
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
                <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder Name" className="w-full p-2 border rounded-md mb-4"/>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowCreateFolderModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleCreateFolder} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Create</button>
                </div>
            </div>
        </div>
      )}
      {showUploadFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Upload File</h3>
                <input type="file" onChange={e => setNewFile(e.target.files[0])} className="w-full p-2 border rounded-md mb-4"/>
                <input type="text" value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="Optional: Rename file" className="w-full p-2 border rounded-md mb-4"/>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowUploadFileModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleUploadFile} className="px-4 py-2 bg-green-500 text-white rounded-lg">Upload</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}