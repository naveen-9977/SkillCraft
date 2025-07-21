// app/dashboard/layout.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from "../components/Sidebar"; // This path is correct
import NotificationIcon from "../components/NotificationIcon";
import './styles/RootLayout.css'; // This path is correct

export default function RootLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mobile detection
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar by default on mobile
      } else {
        setSidebarOpen(true); // Open sidebar by default on desktop
      }
    };
    
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/user');
      const data = await res.json();

      if (res.ok && data.user) {
        if (data.user.isAdmin) {
          router.replace('/admin');
          return;
        }
        if (data.user.status !== 'approved' || !Array.isArray(data.user.batchCodes) || data.user.batchCodes.length === 0) {
            console.log("User not approved or missing batch codes, redirecting to login.");
            router.replace('/login');
            return;
        }
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

  if (loading) {
    return (
      <div className="layout-loading-spinner-container">
        <div className="layout-spinner"></div>
      </div>
    );
  }

  if (!user || user.isAdmin || user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
    return null;
  }

  return (
    <div className="layout-wrapper">
      {/* Fixed top header */}
      <nav className="layout-header">
        <Link href={"/"} className="layout-logo-link">
          <span>
            <Image
              src="/logo.svg"
              alt="SkillCrafters Logo"
              width={30}
              height={30}
              className="layout-logo-img"
              priority
            />
          </span>{" "}
          <h1 className="layout-app-title">SkillCrafters</h1>
        </Link>
        {user && (
          <div className="layout-user-info">
            <NotificationIcon />
            <div className="layout-user-avatar">
              <Link href="/profile">
                {user.name.charAt(0).toUpperCase()}
              </Link>
            </div>
            {/* Removed the Link displaying user.name from the header */}
            {/* <Link
              href="/profile"
              className="layout-user-name-link"
            >
              {user.name}
            </Link> */}
          </div>
        )}
      </nav>

      {/* Sidebar - now positioned fixed and starts below header */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
        user={user} /* Pass the user object to the Sidebar component */
      />

      {/* Main content area - now handles margin/padding for fixed elements */}
      <main className={`layout-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${isMobile ? 'mobile' : ''}`}>
        {children}
      </main>
    </div>
  );
}