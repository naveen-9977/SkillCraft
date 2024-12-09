import React from "react";

export default function Contact() {
  return (
    <section className="px-4 container m-auto">
    <h3 className="text-center font-bold text-xl lg:text-2xl my-6 md:my-10">
      Contact Us
    </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-12 gap-9 ">
        <form className="">
          <div className="md:flex w-full flex gap-6">
            <div className="md:w-1/2">
              <label htmlFor="name" className="block mb-2">
                First Name
              </label>
              <input
                type="text"
                className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-9"
                id="name"
              />
            </div>
            <div className="md:w-1/2">
              <label htmlFor="name" className="block mb-2">
                Last Name
              </label>
              <input
                type="text"
                className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full rounded focus:outline-1 outline-[#393636] mb-9"
                id="name"
              />
            </div>
          </div>
          <label htmlFor="name" className="block mb-2">
            Email Address
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full mr-6 rounded focus:outline-1 outline-[#393636] mb-9"
            id="name"
          />
          <label htmlFor="name" className="block mb-2">
            Phone Number
          </label>
          <input
            type="text"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full mr-6 rounded focus:outline-1 outline-[#393636] mb-9"
            id="name"
          />
          <label htmlFor="message" className="block mb-2">
            Message
          </label>
          <textarea
            id="message"
            className="ring-1 ring-[#D2D2D2] py-[5px] px-2 w-full mr-6 rounded focus:outline-1 outline-[#393636] mb-9 h-80"
          ></textarea>
          <button className="py-2 px-4 bg-primary rounded font-medium text-white w-full">
            Let's Talk
          </button>
        </form>
        <div className="">
          <h3 className="text-xl font-medium my-2 md:text-2xl text-[#2D2D2D]">
            Get in touch
          </h3>
          <p className="text-secondary text-[#676060]">
            Proin volutpat consequat porttitor cras nullam gravida at. Orci
            molestie a eu arcu. Sed ut tincidunt integer elementum id sem. Arcu
            sed malesuada et magna.
          </p>
          <div className="flex flex-col gap-7 py-4 mt-4 text-[#676060]">
            <p className="flex gap-3 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                />
              </svg>
              <span>545 Mavis Island Chicago, IL 99191</span>
            </p>
            <p className="flex gap-3 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>

              <span>+1 (555) 234-5678</span>
            </p>
            <p className="flex gap-3 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>

              <span>hello@example.com</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
