"use client";

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
      const [user, setUser] = useState(null)
  

  const fetchUser = async(req, res)=>{
    let user = await fetch("/api/auth/user")
    let data = await user.json()
    console.log(data.user)
    if(data.user){
      router.replace('/')
    }
    setUser(data.user)
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

     useEffect(() => {
        fetchUser()
      },[])

  return (
    <div className="container m-auto px-4">
      <div className="min-h-screen flex flex-col justify-center md:w-[50vw] lg:w-[40vw] xl:w-[25vw] m-auto">
        <h3 className="text-xl font-semibold text-center mb-10 md:text-2xl">
          Create an account
        </h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="name" className="block mb-2">
            Name
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="email" className="block mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password" className="block mb-2">
            Password
          </label>
          <input
            type="password"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="confirmPassword" className="block mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <button
            type="submit"
            className="bg-primary text-white py-2 rounded mb-6 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center">
          Already have an account?{' '}
          <span 
            onClick={() => router.push('/login')} 
            className="text-primary hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </div>
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Registration Successful!
              </h3>
              <p className="text-sm text-gray-500">
                Please wait while we redirect you to the login page...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
