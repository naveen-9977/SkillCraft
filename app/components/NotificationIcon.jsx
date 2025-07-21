// app/components/NotificationIcon.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationIcon() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(
          data.notifications.filter((n) => !n.isRead).length
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleIconClick = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        await fetch("/api/notifications/mark-as-read", { method: "PUT" });
        setUnreadCount(0);
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  return (
    <div className="relative">
      <button onClick={handleIconClick} className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20">
          <div className="px-4 py-2 text-sm text-gray-700 font-semibold">
            Notifications
          </div>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link
                key={notification._id}
                href={notification.link}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {notification.message}
              </Link>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No new notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
}