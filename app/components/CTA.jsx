import Link from "next/link";
import React from "react";

export default function CTA() {
  return (
    <section className="bg-primary/[3%]">
      <div className="container m-auto px-4 flex">
        <div className="lg:w-1/2 py-10 flex justify-center flex-col">
          <h2 className="font-semibold text-2xl mb-3">
            Unlock Your Potential with SkillCrafters!
          </h2>
          <p className="lg:pr-10">
            Ready to ace your exams? Join SkillCrafters today and gain access to
            personalized learning paths, expert guidance, and a treasure trove
            of resources. Take charge of your success and start preparing
            smarter, not harder. Your journey to excellence begins now—let’s get
            started!
          </p>
          <Link
            href="/contact"
            className="mt-8 bg-primary text-white px-3 py-2 rounded w-fit"
          >
            Connect with us
          </Link>
        </div>
        <div className="hidden lg:flex w-1/2">
          <img
            src="/CTA.png"
            alt=""
            className="w-full h-[300px] object-cover rounded"
          />
        </div>
      </div>
    </section>
  );
}
