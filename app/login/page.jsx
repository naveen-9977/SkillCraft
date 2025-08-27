"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect based on the user's role
        if (data.user.role === 'admin') {
          router.replace("/admin");
        } else if (data.user.role === 'mentor') {
          router.replace("/mentor"); // <-- Redirects mentors here
        } else {
          router.replace("/dashboard");
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container m-auto px-4">
      <div className="min-h-screen flex flex-col justify-center md:w-[50vw] lg:w-[40vw] xl:w-[25vw] m-auto">
        <h3 className="text-xl font-semibold text-center mb-10 md:text-2xl">Sign in to your account</h3>
        <form onSubmit={handleLogin} className="flex flex-col">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <label htmlFor="email" className="block mb-2">Email Address</label>
          <input
            type="email"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password" className="block mb-2">Password</label>
          <input
            type="password"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-2"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="bg-primary text-white py-2 rounded mb-6 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="text-center space-y-2">
            <p>
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">Sign up as a Student</Link>
            </p>
            <p>
              Are you a mentor?{' '}
              <Link href="/mentor-signup" className="text-primary hover:underline">Register here</Link>
            </p>
        </div>
      </div>
    </div>
  );
}