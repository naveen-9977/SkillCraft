import Link from "next/link";
import React from "react";

export default function Footer() {
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

  const socials = [
    {
      name: "Twitter",
      href: "/",
      icon: (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "/",
      icon: (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "/",
      icon: (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm-1.103 2.742c-1.044.043-1.69.206-2.228.41a3.02 3.02 0 00-1.144.748 3.02 3.02 0 00-.748 1.144c-.203.538-.367 1.184-.41 2.228-.043 1.021-.054 1.354-.054 3.73s.011 2.709.054 3.73c.043 1.044.206 1.69.41 2.228a3.02 3.02 0 00.748 1.144 3.02 3.02 0 001.144.748c.538.203 1.184.367 2.228.41 1.021.043 1.354.054 3.73.054s2.709-.011 3.73-.054c1.044-.043 1.69-.206 2.228-.41a3.02 3.02 0 001.144-.748 3.02 3.02 0 00.748-1.144c.203-.538.367-1.184.41-2.228.043-1.021.054-1.354.054-3.73s-.011-2.709-.054-3.73c-.043-1.044-.206-1.69-.41-2.228a3.02 3.02 0 00-.748-1.144 3.02 3.02 0 00-1.144-.748c-.538-.203-1.184-.367-2.228-.41-1.021-.043-1.354-.054-3.73-.054s-2.709.011-3.73.054zM12 9.25a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5z"
            clipRule="evenodd"
          />
          <path d="M14.873 8.242a1.25 1.25 0 10-2.498-0.015 1.25 1.25 0 002.498.015z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-slate-800 text-white pt-12 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="SkillCrafters Logo" className="h-8" />
              <span className="font-semibold text-xl text-white">
                SkillCrafters
              </span>
            </Link>
            <p className="text-slate-300">
              An innovative online coaching platform to help students excel in
              competitive exams.
            </p>
          </div>

          {/* Column 2: Important Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-primary">
              Important Links
            </h4>
            <ul className="space-y-2 text-slate-300">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact and Socials */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-primary">Contact Us</h4>
            <div className="text-slate-300 space-y-2">
              <p>DDU Nagar, Raipur, Chhattisgarh 492010</p>
              <p>+91 9977429858</p>
              <p>mail@skillcrafters.in</p>
            </div>
            <h4 className="font-semibold text-lg text-primary pt-4">
              Follow Us
            </h4>
            <ul className="flex space-x-4">
              {socials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                  >
                    {social.icon}
                    <span>{social.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-slate-700 pt-6 pb-8 text-center text-slate-400">
          &copy; {new Date().getFullYear()} skillcrafters.in. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}