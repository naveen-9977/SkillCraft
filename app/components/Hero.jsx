

import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="px-4 mt-10 container m-auto md:flex">
      <div className="md:w-1/2 md:flex flex-col justify-center lg:pr-10 xl:pr-16">
        <span className="text-xs bg-primary/[13%] text-primary px-3 py-1 rounded-full font-medium w-fit">
          Your Future, Our Craft
        </span>
        <h2 className="text-2xl font-semibold mt-2 lg:text-4xl lg:mt-4">
          Personalized Learning to Empower Your Growth
        </h2>
        <p className="text-zinc-500 mt-3 lg:mt-5 lg:text-lg">
          At SkillCrafters, we believe in unlocking your true potential through
          expert mentorship, innovative teaching methods, and tailored learning
          paths. Whether you aim to excel academically, enhance your
          professional skills, or explore new opportunities, we are here to
          guide you every step of the way. Browse our diverse range of{" "}
          <Link href={"/"} className="text-primary hover:underline">courses </Link>
          or <Link href={"/"} className="text-primary hover:underline">contact us</Link> today to start
          crafting your path to success with SkillCrafters.
        </p>
        <Link href={"/login"} className="mt-10 bg-primary text-white px-4 py-2 rounded w-fit">
          Get Started
        </Link>
      </div>
      <div className="md:w-1/2 mt-6 flex items-center justify-center xl:p-10">
        <img
          src="/hero.jpg"
          alt=""
          className="rounded-lg w-full h-[300px] md:h-[470px] object-cover"
        />
      </div>
    </section>
  );
}
