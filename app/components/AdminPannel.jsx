// app/components/AdminPannel.jsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import '../admin/styles/AdminLayout.css'; // Import the admin layout CSS

export default function AdminPannel({ isOpen, setIsOpen, isMobile, user }) { // 'user' prop is received here
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Navigation items for the admin panel
  const navItems = [
    {
      name: "Overview",
      path: "/admin",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="admin-sidebar-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      ),
    },
    {
      name: "Batches",
      path: "/admin/batches",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="admin-sidebar-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5l6 4.5-6 4.5-6-4.5 6-4.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.875L18 15.375M12 10.875L6 15.375M12 10.875V19.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
        </svg>
      ),
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="admin-sidebar-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15A2.25 2.25 0 0 0 21.75 17.25V5.25A2.25 2.25 0 0 0 19.5 3H4.5A2.25 2.25 0 0 0 2.25 5.25v12A2.25 2.25 0 0 0 4.5 19.5ZM12 9a.75.75 0 0 0 0 1.5h.008a.75.75 0 0 0-.008-1.5ZM12 12a.75.75 0 0 0 0 1.5h.008a.75.75 0 0 0-.008-1.5ZM12 15a.75.75 0 0 0 0 1.5h.008a.75.75 0 0 0-.008-1.5Z" />
        </svg>
      ),
    },
    {
      name: "Tests",
      path: "/admin/tests",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="admin-sidebar-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
          />
        </svg>
      ),
    },
    {
      name: "Leaderboard",
      path: "/admin/leaderboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="admin-sidebar-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25A2.25 2.25 0 0 1 10.5 15.75V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75h2.25A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25H15.75a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5h2.25A2.25 2.25 0 0 1 20.25 15.75V18a2.25 2.25 0 0 1-2.25 2.25H15.75a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
        </svg>
      ),
    },
    {
      name: "Study Material",
      path: "/admin/studymaterial",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="admin-sidebar-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
    },
    {
      name: "Blog Posts",
      path: "/admin/blogs",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="admin-sidebar-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
          />
        </svg>
      ),
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="admin-sidebar-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
          />
        </svg>
      ),
    },
    {
      name: "Assignments",
      path: "/admin/assignments",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="admin-sidebar-icon admin-sidebar-icon-rotate"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
      ),
    },
    {
      name: "Live Classes",
      path: "/admin/live-classes",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="admin-sidebar-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
        </svg>
      ),
    },
    
  ];

  return (
    <>
      {/* Backdrop for mobile (only appears on mobile when sidebar is open) */}
      {isMobile && isOpen && (
        <div 
          className="admin-sidebar-backdrop"
          onClick={toggleSidebar} // Use internal toggle
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar-container ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        } ${isMobile ? "mobile" : ""}`}
      >
        <div className="admin-sidebar-logo">
          
          <span className="admin-logo-text">Menu</span>
        </div>
        
        {/* Toggle button - placed inside sidebar, near the logo */}
        <button
          onClick={toggleSidebar}
          className={`admin-sidebar-toggle-button ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="admin-sidebar-toggle-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="admin-sidebar-toggle-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
        
        {/* Scrollable area for nav items */}
        <div className="admin-sidebar-nav-scroll-area">
          <nav className="admin-sidebar-nav-list">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`admin-sidebar-nav-item ${
                  pathname === item.path ? "admin-sidebar-nav-item-active" : ""
                }`}
                // Close sidebar on mobile when a nav item is clicked
                onClick={isMobile ? toggleSidebar : undefined} // Use internal toggle
              >
                <span
                  className={`admin-sidebar-nav-icon-wrapper ${
                    pathname === item.path ? "admin-sidebar-nav-icon-active" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="admin-sidebar-nav-item-text">{item.name}</span>
                {pathname === item.path && (
                  <span className="admin-sidebar-active-indicator"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar footer section - now re-included */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <div className="admin-avatar">
              {user ? user.name.charAt(0).toUpperCase() : 'AD'} {/* Dynamically displays user's initial */}
            </div>
            <div className="admin-user-info">
              <div className="admin-username">{user ? user.name : 'Admin User'}</div> {/* Dynamically displays user's full name */}
              <div className="admin-user-role">Administrator</div> {/* Statically set role */}
            </div>
          </div>
          <div className="admin-sidebar-footer-text">
            © {new Date().getFullYear()} SkillCrafters
          </div>
        </div>
      </aside>
    </>
  );
}