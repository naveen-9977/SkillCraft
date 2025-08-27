"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Folder, File, ArrowLeft, Video, Image as ImageIcon } from 'lucide-react';

export default function StudentStudyMaterialsPage() {
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation state
  const [currentBatch, setCurrentBatch] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch("/api/studymaterial"); // Student-specific API
      const data = await res.json();
      if (res.ok) {
        setBatches(data.batches);
        setMaterials(data.materials);
      } else {
        setError(data.error || "Failed to fetch your study materials.");
      }
    } catch (err) {
      setError("An error occurred while loading your materials.");
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
      return { currentItems: batches, currentPathName: 'Your Batches' };
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
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading your materials...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
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
        </header>

        <main className="bg-white p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentItems.map(item => (
              <div 
                key={item._id} 
                className="flex flex-col items-center justify-center p-4 border rounded-lg aspect-square cursor-pointer hover:bg-gray-50"
                onClick={() => item.type === 'folder' || !currentBatch ? (item.batchName ? handleBatchClick(item) : handleFolderClick(item)) : window.open(item.resourceUrl, '_blank')}
              >
                {item.type === 'folder' || !currentBatch ? <Folder className="w-16 h-16 text-blue-400" /> : <FileTypeIcon url={item.resourceUrl} />}
                <span className="text-center text-sm mt-2 break-all">{item.batchName || item.title}</span>
                {item.type === 'file' && <span className="text-xs text-gray-400">{getFileExtension(item.resourceUrl)}</span>}
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
    </div>
  );
}