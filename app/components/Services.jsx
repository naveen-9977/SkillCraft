import React from "react";

export default function Services() {
  return (
    <main className="">
      <section className="container px-4 m-auto">
      <h3 className="text-center font-bold text-xl lg:text-2xl my-6 md:my-10">
        Our Services
      </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <img
              src="https://hyprland.org/imgs/ricing_competitions/2/end_4.webp"
              alt=""
              className="h-[253px] lg:h-[300px] w-full object-cover rounded"
            />
            <h4 className="mt-3 text-lg mb-1">General Surgery</h4>
            <p>
              Expert surgical care for conditions like hernias, appendicitis,
              and gallbladder issues. We ensure safe procedures, quick recovery,
              and personalized attention.
            </p>
          </div>
          <div className="flex flex-col">
            <img
              src="https://hyprland.org/imgs/ricing_competitions/2/flafy.webp"
              alt=""
              className="h-[253px] lg:h-[300px] w-full object-cover rounded"
            />
            <h4 className="mt-3 mb-1 text-lg">24/7 Emergency Service</h4>
            <p>
              We provide expert, round-the-clock care for all emergencies. With
              a skilled medical team, your safety is always our top priority.
            </p>
          </div>
          <div className="flex flex-col">
            <img
              src="https://hyprland.org/imgs/ricing_competitions/2/day-night.webp"
              alt=""
              className="h-[253px] lg:h-[300px] w-full object-cover rounded"
            />
            <h4 className="mt-3 mb-1 text-lg">Modular OTs</h4>
            <p>
              Advanced, sterile surgical rooms with the latest technology,
              ensuring safety and precision for optimal patient outcomes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}