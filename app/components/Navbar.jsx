"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import NotificationIcon from "./NotificationIcon"; // Import the new component

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          // If not authenticated or error, clear user state
          setUser(null);
          
          // If token is expired or invalid, clear it
          if (data.error === 'Token expired' || data.error === 'Invalid token') {
            fetch('/api/auth/logout', { method: 'POST' });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (res.ok) {
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const links = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Blogs",
      href: "/blogs",
    },
    {
      name: "Services",
      href: "/services",
    },
    {
      name: "About",
      href: "/about",
    },
  ];
  return (
    <nav className="px-4 py-4 border-b-4 border-primary bg-white">
      <div className="flex items-center justify-between container m-auto ">
        <Link href={"/"} className="flex items-center gap-2">
          <span>
            <img src="/logo.svg" alt="" className="w-8" />
          </span>{" "}
          <h1 className="text-xl">SkillCrafters</h1>
        </Link>
        <div id="for-mobile" className="lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </div>
        <div
          id="for-desktop"
          className="hidden lg:flex items-center justify-between text-[#676060]"
        >
          <ul className="flex items-center gap-6">
            {links.map((link, index) => (
              <li key={index}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div id="for-desk-btn" className="hidden lg:flex gap-4 items-center">
          {user ? (
            <>
              <NotificationIcon />
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-3 rounded-full hover:bg-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href={"/login"} className="py-1 px-5 hover:text-primary">
                Login
              </Link>
              <Link
                href={"/signup"}
                className="py-1 px-5 bg-primary text-white rounded hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}