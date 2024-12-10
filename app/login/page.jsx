"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const getName = (e) => {
    setName(e.target.value);
  };
  const getPassword = (e) => {
    setPassword(e.target.value);
  };

  async function sendRequest() {
    let res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });

    const data = await res.json();

    if (res.status === 200 && data.isAdmin === true) {
      console.log(data)
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
        <h3 className="text-xl font-semibold text-center mb-10 md:text-2xl">Sign in to your account</h3>
        <div className="flex flex-col">
          <label htmlFor="name" className="block mb-2">
            Username
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-9"
            id="name"
            value={name}
            onChange={getName}
          />
          <label htmlFor="name" className="block mb-2">
            Password
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-2"
            id="name"
            value={password}
            onChange={getPassword}
          />
          <span className="self-end text-primary mb-9">Forgot password?</span>
        </div>
        <button className="bg-primary text-white py-2 rounded mb-9" onClick={sendRequest}>Sign in</button>
        <p className="text-center">Don't have account? <span className="text-primary hover:underline">sign up</span></p>
      </div>
    </div>
  );
}
