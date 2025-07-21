// app/admin/layout.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminPannel from "../components/AdminPannel";
import NotificationIcon from "../components/NotificationIcon"; // Re-import if it was removed
import './styles/AdminLayout.css';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch("/api/auth/user"); 
        const data = await res.json();
        if (res.ok && data.user && data.user.isAdmin) {
          setUser(data.user); 
        } else {
          setUser(null);
          router.replace('/login'); 
        }
      } catch (error) {
        console.error("Admin auth check failed:", error);
        setUser(null); 
        router.replace('/login'); 
      } finally {
        setLoading(false);
      }
    };
    checkAdminAuth();
  }, []); 

  if (loading) {
    return (
      <div className="admin-layout-loading-spinner-container">
        <div className="admin-layout-spinner"></div>
      </div>
    );
  }

  if (!user) { 
    return null; 
  }

  return (
    <div className="admin-layout-wrapper">
      {/* Fixed top header for admin panel */}
      <nav className="admin-layout-header">
          {/* Re-instated: SkillCrafters logo and title link */}
          <Link href={"/"} className="admin-layout-logo-link">
            <span>
              <Image src="/logo.svg" alt="SkillCrafters Logo" width={30} height={30} className="admin-layout-logo-img" priority />
            </span>{" "}
            <h1 className="admin-layout-app-title">SkillCrafters</h1>
          </Link>
          {user && (
            <div className="admin-layout-user-info">
              {/* Re-instated: NotificationIcon */}
              <NotificationIcon />
              <div className="admin-layout-user-avatar">
                <Link href="/profile">
                  {user.name.charAt(0).toUpperCase()}
                </Link>
              </div>
              {/* This is the only part removed: the Link displaying user.name */}
              {/* <Link
                href="/profile"
                className="admin-layout-user-name-link"
              >
                {user.name}
              </Link> */}
            </div>
          )}
      </nav>

      {/* Sidebar component - passes the fetched user object */}
      <AdminPannel 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isMobile={isMobile}
        user={user} 
      />

      {/* Main content area */}
      <main className={`admin-layout-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${isMobile ? 'mobile' : ''}`}>
        {children}
      </main>
    </div>
  );
}