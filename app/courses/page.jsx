import React from "react";

export default function Cources() {
  let courses = [
    {
      title: "Introduction to JavaScript",
      price: "2,000",
      imageUrl: "https://fireship.io/courses/js/img/featured.webp",
    },
    {
      title: "NextJS Full Stack Mastery",
      price: "5,000",
      imageUrl: "https://fireship.io/courses/nextjs/img/featured.webp",
    },
    {
      title: "Linux From Scratch",
      price: "1,000",
      imageUrl: "https://fireship.io/courses/linux/img/featured.webp",
    },
    {
      title: "Svelt For Beginers",
      price: "4,000",
      imageUrl: "https://fireship.io/courses/sveltekit/img/featured.webp",
    },
  ];
  return (
    <section className="px-4 container m-auto">
      <h3 className="text-center font-bold text-xl lg:text-2xl my-6 md:my-10">
        Courses
      </h3>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
        {courses.map((course, index) => (
          <div className="" key={index}>
            <div className="">
              <img
                src={course.imageUrl}
                alt=""
                className="h-[238px] w-full object-cover rounded-lg"
              />
            </div>
            <div className="mt-3 flex flex-col">
              <h5 className="text-[#393636] text-lg mb-1">{course.title}</h5>
              <span className="font-semibold text-[#2D2D2D]">₹ {course.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
