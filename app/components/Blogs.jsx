import React from "react";

export default function BlogsCmp() {
  return (
    <section className="container px-4 m-auto py-16">
      <h3 className="text-2xl font-medium text-center pb-16">
        Our Blogs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="flex flex-col">
          <img
            src="/blog1.png"
            alt=""
            className="h-[253px] lg:h-[300px] w-full object-cover rounded"
          />
          <h4 className="mt-2 text-lg">Boost Your Exam Scores</h4>
          <a href="/" className="text-primary text-sm">
            Read more
          </a>
        </div>
        <div className="flex flex-col">
          <img
            src="/blog2.jpg"
            alt=""
            className="h-[253px] lg:h-[300px] w-full object-cover rounded"
          />
          <h4 className="mt-2 text-lg">Why Personalized Plans Matter</h4>
          <a href="/" className="text-primary text-sm">
            Read more
          </a>
        </div>
        <div className="flex flex-col">
          <img
            src="/blog3.jpg"
            alt=""
            className="h-[253px] lg:h-[300px] w-full object-cover rounded"
          />
          <h4 className="mt-2 text-lg">The Power of Mock Tests</h4>
          <a href="/" className="text-primary text-sm">
            Read more
          </a>
        </div>
      </div>
    </section>
  );
}
