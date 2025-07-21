"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
// NEW: Import icons from lucide-react
import { FileText, Video, Link as LinkIcon, File, HelpCircle } from "lucide-react"; 

export default function StudyMaterialsPage() {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudyMaterials();
  }, []);

  const fetchStudyMaterials = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch study materials for the current user's batch code
      const res = await fetch("/api/studymaterial");
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

  // NEW: Helper function to get the appropriate icon component
  const getResourceIcon = (resourceType) => {
    switch (resourceType) {
      case 'pdf':
        return <FileText size={48} className="text-red-500" />; // Example: Red for PDF
      case 'video':
        return <Video size={48} className="text-blue-500" />; // Example: Blue for Video
      case 'link':
        return <LinkIcon size={48} className="text-green-500" />; // Example: Green for Link
      case 'document':
        return <File size={48} className="text-purple-500" />; // Example: Purple for Document
      case 'other':
      default:
        return <HelpCircle size={48} className="text-gray-500" />; // Default for 'other' or unknown
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
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
      <div className="mb-6">
        <h1 className="text-xl">Study Material</h1>
      </div>
      {studyMaterials.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No study materials available for your batch at the moment.
        </div>
      ) : (
        studyMaterials.map((item, index) => (
          <Link
            href={item.resourceUrl}
            target="_blank"
            className="mt-2 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded flex items-center gap-8"
            key={index}
          >
            <div className="hidden md:flex items-center">
              {/* OLD: <img src="/pdf-ico.svg" alt="" className="size-12" /> */}
              {/* NEW: Dynamically render icon based on resourceType */}
              {getResourceIcon(item.resourceType)}
            </div>
            <div className="">
              <h4 className="text-base font-medium">{item.title}</h4>
              <p className="text-zinc-500 text-sm mt-1">by {item.mentor}</p>
              <p className="text-zinc-500 text-xs mt-1">Type: {item.resourceType}</p>
              <p className="text-zinc-500 text-xs mt-1">Batch: {item.batchCode}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
