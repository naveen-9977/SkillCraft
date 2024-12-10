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

  const socials = [
    {
      name: "Twitter",
      href: "/",
    },
    {
      name: "Facebook",
      href: "/",
    },
    {
      name: "Instagram",
      href: "/",
    },
  ];

  return (
    <>
      <section className="text-secondary py-10 lg:py-12 mt-8 ">
        <div className="grid container px-4 m-auto sm:grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="">
            <h2>Logo Here</h2>
            <p className="  py-2">
              SkillCrafters is an innovative online coaching platform designed
              to help students excel in competitive exams.
            </p>
          </div>
          <div className="">
            <h4 className="text-primary font-semibold text-xl mb-3">
              Important Links
            </h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>{link.name}</li>
              ))}
            </ul>
          </div>
          <div className="">
            <h4 className="text-primary font-semibold text-xl mb-3">Socials</h4>
            <ul className="space-y-3">
              {socials.map((social) => (
                <li key={social.name}>{social.name}</li>
              ))}
            </ul>
          </div>
          <div className="">
            <h4 className="text-primary font-semibold text-xl">Address</h4>
            <p className="  mb-4">
              Balaji Colony, Dhamtari, <br /> Chhattisgarh 493773
            </p>
            <h4 className="text-primary font-semibold text-xl">Phone</h4>
            <p className="  mb-4">+91 346548765</p>
            <h4 className="text-primary font-semibold text-xl">Email</h4>
            <p className="  mb-4">mail@mailinator.com</p>
          </div>
        </div>
      </section>
      <footer className=" pb-5  ">
        <div className="container m-auto px-4 text-center text-paragraph/80">
          &copy; Copyrights 2024 skillcrafters.in. All rights reserved.
        </div>
      </footer>
    </>
  );
}
