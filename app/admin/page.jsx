"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { Users, UserCheck, UserPlus, BookOpen, ClipboardCheck, FileText, Video } from 'lucide-react';
import './styles/AdminDashboard.css'; // Make sure this CSS file exists

export default function AdminDashboardPage() {
  const [admin, setAdmin] = useState(null);
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
        const [userRes, statsRes] = await Promise.all([
          fetch("/api/auth/user"),
          fetch("/api/admin/dashboard-overview")
        ]);

        const userData = await userRes.json();
        if (userRes.ok && userData.user) setAdmin(userData.user);
        else throw new Error(userData.error || "Failed to fetch admin details.");

        const statsData = await statsRes.json();
        if (statsRes.ok) {
            setOverviewStats(statsData.stats);
        } else {
            throw new Error(statsData.error || "Failed to fetch dashboard stats.");
        }

      } catch (err) {
        setError("An error occurred while loading the dashboard.");
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
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-message">Welcome back, {admin?.name}!</h1>
          <p className="header-subtitle">Here's an overview of the platform.</p>
        </div>
        <div className="date-display">{date}</div>
      </header>

      <section className="overview-stats">
         <Link href="/admin/users" className="overview-card overview-color-1">
            <div className="overview-icon"><Users size={24} /></div>
            <p className="overview-value">{overviewStats?.totalMentors ?? 0}</p>
            <p className="overview-label">Total Mentors</p>
        </Link>
        <Link href="/admin/users" className="overview-card overview-color-2">
            <div className="overview-icon"><UserCheck size={24} /></div>
            <p className="overview-value">{overviewStats?.approvedStudents ?? 0}</p>
            <p className="overview-label">Approved Students</p>
        </Link>
        <Link href="/admin/users" className="overview-card overview-color-3">
            <div className="overview-icon"><UserPlus size={24} /></div>
            <p className="overview-value">{overviewStats?.totalPendingUsers ?? 0}</p>
            <p className="overview-label">Pending Approvals</p>
        </Link>
      </section>

      <div className="dashboard-main-content">
        <section className="content-stats">
          <h2 className="section-title">Platform Content</h2>
            <div className="stats-grid">
                <Link href="/admin/batches" className="stat-card card-color-0">
                  <div className="card-icon"><BookOpen size={28} /></div>
                  <h3 className="batch-name">Total Batches</h3>
                  <p className="student-count">{overviewStats?.totalBatches ?? 0}</p>
                </Link>
                <Link href="/admin/assignments" className="stat-card card-color-1">
                  <div className="card-icon"><ClipboardCheck size={28} /></div>
                  <h3 className="batch-name">Total Assignments</h3>
                  <p className="student-count">{overviewStats?.totalAssignments ?? 0}</p>
                </Link>
                <Link href="/admin/tests" className="stat-card card-color-2">
                  <div className="card-icon"><FileText size={28} /></div>
                  <h3 className="batch-name">Total Tests</h3>
                  <p className="student-count">{overviewStats?.totalTests ?? 0}</p>
                </Link>
                <Link href="/admin/live-classes" className="stat-card card-color-3">
                  <div className="card-icon"><Video size={28} /></div>
                  <h3 className="batch-name">Total Live Classes</h3>
                  <p className="student-count">{overviewStats?.totalLiveClasses ?? 0}</p>
                </Link>
            </div>
        </section>
      </div>
    </div>
  );
}
