"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from "../components/Sidebar";
import NotificationIcon from "../components/NotificationIcon"; // Ensure this path is correct
import './styles/RootLayout.css';

export default function RootLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();

        if (res.ok && data.success && data.user && data.user.role === 'student' && data.user.status === 'approved') {
          setUser(data.user);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="layout-loading-spinner-container">
        <div className="layout-spinner"></div>
      </div>
    );
  }

  return (
    <div className="layout-wrapper">
      <nav className="layout-header">
        {isMobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar" className="p-2 -ml-2 mr-2 rounded-md text-gray-700 hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <Link href={"/"} className="layout-logo-link">
          <span>
            <Image src="/logo.svg" alt="SkillCrafters Logo" width={30} height={30} className="layout-logo-img" priority />
          </span>{" "}
          <h1 className="layout-app-title">SkillCrafters</h1>
        </Link>
        {user && (
          <div className="layout-user-info">
            {/* UPDATED: Pass the user object to the NotificationIcon */}
            <NotificationIcon user={user} />
            <div className="layout-user-avatar">
              <Link href="/profile">{user.name.charAt(0).toUpperCase()}</Link>
            </div>
          </div>
        )}
      </nav>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} user={user} />

      <main className={`layout-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${isMobile ? 'mobile' : ''}`}>
        {children}
      </main>
    </div>
  );
}