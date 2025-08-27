"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { Users, BookOpen, ClipboardCheck, FileText, Video, Award } from 'lucide-react';

// Icon component for different activity types
const ActivityIcon = ({ type }) => {
  let icon;
  let bgColorClass;

  switch (type) {
    case 'new_submission':
      icon = <ClipboardCheck size={20} />;
      bgColorClass = 'bg-blue-100 text-blue-600';
      break;
    case 'new_test_result':
      icon = <Award size={20} />;
      bgColorClass = 'bg-green-100 text-green-600';
      break;
    default:
      icon = <Users size={20} />;
      bgColorClass = 'bg-gray-100 text-gray-600';
  }
  return (
    <div className={`activity-icon-wrapper ${bgColorClass}`}>
      {icon}
    </div>
  );
};

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [batchStats, setBatchStats] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [userRes, statsRes, activitiesRes] = await Promise.all([
          fetch("/api/auth/user"),
          fetch("/api/mentor/dashboard"),
          fetch("/api/admin/notifications") // Mentors get their notifications from this endpoint
        ]);

        const userData = await userRes.json();
        if (userRes.ok && userData.user) setMentor(userData.user);
        else throw new Error(userData.error || "Failed to fetch mentor details.");

        const statsData = await statsRes.json();
        if (statsRes.ok) {
            // Correctly set the state based on the API response structure
            setBatchStats(statsData.batchStats);
            setOverviewStats(statsData.overviewStats);
        } else {
            throw new Error(statsData.error || "Failed to fetch dashboard stats.");
        }

        const activitiesData = await activitiesRes.json();
        if (activitiesRes.ok) setActivities(activitiesData.notifications);
        else throw new Error(activitiesData.error || "Failed to fetch recent activities.");

      } catch (err) {
        setError("An error occurred while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

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
    <div className="mentor-dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-message">Welcome back, {mentor?.name}!</h1>
          <p className="header-subtitle">Let's make today a productive day.</p>
        </div>
        <div className="date-display">{date}</div>
      </header>

      <section className="overview-stats">
         <Link href="/admin/assignments" className="overview-card overview-color-1">
            <div className="overview-icon"><ClipboardCheck size={24} /></div>
            <p className="overview-value">{overviewStats?.assignments ?? 0}</p>
            <p className="overview-label">Total Assignments</p>
        </Link>
        <Link href="/admin/tests" className="overview-card overview-color-2">
            <div className="overview-icon"><FileText size={24} /></div>
            <p className="overview-value">{overviewStats?.tests ?? 0}</p>
            <p className="overview-label">Total Tests</p>
        </Link>
        <Link href="/admin/live-classes" className="overview-card overview-color-3">
            <div className="overview-icon"><Video size={24} /></div>
            <p className="overview-value">{overviewStats?.liveClasses ?? 0}</p>
            <p className="overview-label">Total Live Classes</p>
        </Link>
      </section>

      <div className="dashboard-main-content">
        <section className="batch-stats">
          <h2 className="section-title">Your Batches</h2>
          {batchStats && batchStats.length > 0 ? (
            <div className="stats-grid">
              {batchStats.map((batch, index) => (
                <Link href={`/mentor/students/${batch.batchCode}`} key={batch._id} className={`stat-card card-color-${index % 4}`}>
                  <div className="card-icon"><Users size={28} /></div>
                  <h3 className="batch-name">{batch.batchName}</h3>
                  <p className="batch-code">{batch.batchCode}</p>
                  <p className="student-count">{batch.studentCount}</p>
                  <p className="count-label">Students</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-data-card">
              <h2 className="no-data-title">No Batches Assigned</h2>
              <p className="no-data-text">Please contact an administrator.</p>
            </div>
          )}
        </section>

        <section className="recent-activity">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-marquee-container">
            <div className="activity-marquee">
                {activities.length === 0 ? (
                    <div className="activity-item-centered">No recent activities.</div>
                ) : (
                    // Duplicate the activities array for a seamless scrolling effect
                    [...activities, ...activities].map((activity, index) => (
                    <Link href={activity.link} key={`${activity._id}-${index}`} className="activity-item-link">
                        <div className="activity-item">
                        <ActivityIcon type={activity.type} />
                        <div className="activity-content">
                            <p className="activity-description">{activity.message}</p>
                        </div>
                        <p className="activity-time">{timeSince(activity.createdAt)}</p>
                        </div>
                    </Link>
                    ))
                )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
