"use client";

import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getName = (e) => {
    setName(e.target.value);
  };
  const getEmail = (e) => {
    setEmail(e.target.value);
  };
  const getPassword = (e) => {
    setPassword(e.target.value);
  };
  const getConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  async function sendRequest() {
    let res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();

    if (res.status === 200) {
      console.log(data);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      // will throw error
    }
  }

  return (
    <div className="container m-auto px-4">
      <div className="min-h-screen flex flex-col justify-center md:w-[50vw] lg:w-[40vw] xl:w-[25vw] m-auto">
        <h3 className="text-xl font-semibold text-center mb-10 md:text-2xl">
          Create an account
        </h3>
        <div className="flex flex-col">
          <label htmlFor="name" className="block mb-2">
            Name
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6"
            id="name"
            value={name}
            onChange={getName}
          />
          <label htmlFor="email" className="block mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6"
            id="email"
            value={email}
            onChange={getEmail}
          />
          <label htmlFor="password" className="block mb-2">
            Password
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-6 "
            id="password"
            value={password}
            onChange={getPassword}
          />
          <label htmlFor="confirmPassword" className="block mb-2">
            Confirm Password
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-9 "
            id="confirmPassword"
            value={confirmPassword}
            onChange={getConfirmPassword}
          />
        </div>
        <button
          className="bg-primary text-white py-2 rounded mb-9"
          onClick={sendRequest}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
