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
              src="/services1.webp"
              alt=""
              className="h-[253px] lg:h-[300px] w-full object-cover rounded"
            />
            <h4 className="mt-3 text-lg mb-1">Comprehensive Test Series</h4>
            <p>
              Prepare with tests that mirror real exams. Analyze performance and
              improve weak areas with feedback.
            </p>
          </div>
          <div className="flex flex-col">
            <img
              src="/services2.webp"
              alt=""
              className="h-[253px] lg:h-[300px] w-full object-cover rounded"
            />
            <h4 className="mt-3 mb-1 text-lg">Expert Study Materials</h4>
            <p>
              Access resources crafted by experts, covering essential topics and
              strategies. Stay updated with the latest syllabus.
            </p>
          </div>
          <div className="flex flex-col">
            <img
              src="/services3.webp"
              alt=""
              className="h-[253px] lg:h-[300px] w-full object-cover rounded"
            />
            <h4 className="mt-3 mb-1 text-lg">Personalized Learning Plans</h4>
            <p>
              Learn at your pace with tailored plans. SkillCrafters adapts to
              your strengths, keeping you on track.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
