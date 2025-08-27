"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { BookOpen, ClipboardCheck, FileText, Video } from 'lucide-react';
import './styles/StudentDashboard.css'; // Make sure this CSS file exists

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [batchInfos, setBatchInfos] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [userRes, batchesRes, statsRes] = await Promise.all([
            fetch("/api/auth/user"),
            fetch("/api/batch1"),
            fetch("/api/student/dashboard")
        ]);

        const userData = await userRes.json();
        if (userRes.ok && userData.user) {
            setUser(userData.user);
        } else {
            throw new Error(userData.error || "Failed to fetch user data.");
        }
        
        const batchesData = await batchesRes.json();
        if (batchesRes.ok) {
            setBatchInfos(batchesData.data);
        } else {
            throw new Error(batchesData.error || "Failed to fetch batch information.");
        }

        const statsData = await statsRes.json();
        if (statsRes.ok) {
            setOverviewStats(statsData.overviewStats);
        } else {
            throw new Error(statsData.error || "Failed to fetch dashboard stats.");
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while loading your dashboard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="student-dashboard-container">
        <header className="dashboard-header">
            <div>
                <h1 className="welcome-message">Welcome, {user?.name}!</h1>
                <p className="header-subtitle">Your learning journey continues here.</p>
            </div>
            <div className="date-display">{date}</div>
        </header>

        <section className="overview-stats">
            <Link href="/dashboard/assignments" className="overview-card overview-color-1">
                <div className="overview-icon"><ClipboardCheck size={24} /></div>
                <p className="overview-value">{overviewStats?.assignments ?? 0}</p>
                <p className="overview-label">Total Assignments</p>
            </Link>
            <Link href="/dashboard/tests" className="overview-card overview-color-2">
                <div className="overview-icon"><FileText size={24} /></div>
                <p className="overview-value">{overviewStats?.tests ?? 0}</p>
                <p className="overview-label">Total Tests</p>
            </Link>
            <Link href="/dashboard/live-classes" className="overview-card overview-color-3">
                <div className="overview-icon"><Video size={24} /></div>
                <p className="overview-value">{overviewStats?.liveClasses ?? 0}</p>
                <p className="overview-label">Total Live Classes</p>
            </Link>
        </section>

        <section className="batch-stats">
          <h2 className="section-title">Your Batches</h2>
          {batchInfos.length > 0 ? (
            <div className="stats-grid">
              {batchInfos.map((batch, index) => (
                <div key={batch._id} className={`stat-card card-color-${index % 4}`}>
                  <div className="card-icon"><BookOpen size={28} /></div>
                  <h3 className="batch-name">{batch.batchName}</h3>
                  <p className="batch-code">{batch.batchCode}</p>
                  <p className="subjects-list">{batch.subjects}</p>
                  <p className="subjects-label">Subjects</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-card">
              <h2 className="no-data-title">No Batches Assigned</h2>
              <p className="no-data-text">You are not currently assigned to any batches. Please contact an administrator.</p>
            </div>
          )}
        </section>
    </div>
  );
}
