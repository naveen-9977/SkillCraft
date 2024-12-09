import Link from "next/link";
import React from "react";

export default function CTA() {
  return (
    <section className="bg-primary/[3%]">
      <div className="container m-auto px-4 flex">
        <div className="lg:w-1/2 py-10 flex justify-center flex-col">
          <h2 className="font-semibold text-2xl mb-3">
            Get One Step Ahead Of Disease
          </h2>
          <p className="lg:pr-10">
            Take charge of your health with expert care and advanced treatments
            at SMC Hospital. Let us help you stay ahead of health challenges and
            live a healthier, worry-free life.
          </p>
          <Link
            href="/contact"
            className="mt-8 bg-primary text-white px-3 py-2 rounded w-fit"
          >
            Book an Appointment
          </Link>
        </div>
        <div className="hidden lg:flex w-1/2">
          <img
            src="https://hyprland.org/imgs/ricing_competitions/3/aylur.webp"
            alt=""
            className="w-full h-[300px] object-cover rounded"
          />
        </div>
      </div>
    </section>
  );
}
