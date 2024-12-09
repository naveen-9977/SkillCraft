import Link from "next/link";
import React from "react";

export default function Navbar() {
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
      name: "Courses",
      href: "/courses",
    },
    {
      name: "Services",
      href: "/services",
    },
    {
      name: "About",
      href: "/about",
    },
    {
      name: "Contact",
      href: "/contact",
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
            viewBox="0 0 24 24"
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
        <div id="for-desk-btn" className="hidden lg:flex gap-4 itece">
          <Link href={"/login"} className="py-1 px-5">Login</Link>
          <Link href={"/signup"} className="py-1 px-5 bg-primary text-white rounded">
            signup
          </Link>
        </div>
      </div>
    </nav>
  );
}
