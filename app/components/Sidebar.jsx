"use client";
import '../style/Sidebar.css';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, setIsOpen, isMobile, user }) {
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="sidebar-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> </svg> ),
    },
    {
      name: "Tests",
      path: "/dashboard/tests",
      icon: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="sidebar-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /> </svg> ),
    },
    {
      name: "Study Material",
      path: "/dashboard/studymaterial",
      icon: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="sidebar-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /> </svg> ),
    },
    {
      name: "Announcements",
      path: "/dashboard/announcements",
      icon: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="sidebar-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" /> </svg> ),
    },
    {
      name: "Assignments",
      path: "/dashboard/assignments",
      icon: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="sidebar-icon sidebar-icon-rotate"> <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /> </svg> ),
    },
    {
      name: "Live Classes",
      path: "/dashboard/live-classes",
      icon: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="sidebar-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /> </svg> ),
    },
  ];

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={`sidebar-container ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        } ${isMobile ? "mobile" : ""}`}
      >
        <div className="sidebar-logo">
          <span className="logo-text">Menu</span>
        </div>
        <button
          onClick={toggleSidebar}
          className={`sidebar-toggle-button ${isOpen ? 'open' : ''}`}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="sidebar-toggle-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="sidebar-toggle-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-1.5 5.25h16.5" /> </svg> )}
        </button>
        <div className="sidebar-nav-scroll-area">
          <nav className="sidebar-nav-list">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-nav-item ${
                  pathname === item.path ? "sidebar-nav-item-active" : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <span
                  className={`sidebar-nav-icon-wrapper ${
                    pathname === item.path ? "sidebar-nav-icon-active" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="sidebar-nav-item-text">{item.name}</span>
                {pathname === item.path && (
                  <span className="sidebar-active-indicator"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {user ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="user-info">
              <div className="username">{user ? user.name : 'Student'}</div>
              <div className="user-role">Student</div>
            </div>
          </div>
          <div className="sidebar-footer-text">
            © {new Date().getFullYear()} SkillCrafters
          </div>
        </div>
      </aside>
    </>
  );
}