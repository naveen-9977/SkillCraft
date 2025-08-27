"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Modern icon for the bell
const IconBell = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> );

export default function NotificationIcon({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
    // Add event listener to close dropdown when clicking outside
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const endpoint = (user.role === 'admin' || user.role === 'mentor') 
        ? "/api/admin/notifications" 
        : "/api/notifications";

      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
      } else {
        console.error("Failed to fetch notifications:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleIconClick = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        const endpoint = (user.role === 'admin' || user.role === 'mentor')
            ? "/api/admin/notifications/mark-as-read"
            : "/api/notifications/mark-as-read";
        
        await fetch(endpoint, { method: "PUT" });
        setUnreadCount(0);
        // Optimistically update the UI without refetching immediately
        setNotifications(notifications.map(n => ({...n, isRead: true})));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleIconClick} className="relative text-gray-600 hover:text-indigo-600">
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-800 font-semibold">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                <Link
                    key={notification._id}
                    href={notification.link}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                >
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                </Link>
                ))
            ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                You're all caught up!
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}