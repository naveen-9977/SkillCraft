import React from "react";

export default function WhyUs() {
  return (
    <section className="px-4 py-9 container m-auto">
      <h3 className="text-xl font-semibold text-center py-10 mt-4 md:text-3xl">
        Why choose Skill Crafters
      </h3>
      <div className="lg:flex">
        <div className="hidden lg:flex justify-center items-center lg:w-1/2 xl:w-[40%] lg:px-6 xl:px-14 h-fit">
          <img
            src="tubelight-c-500.jpg"
            alt=""
            className="rounded-xl lg:h-full xl:h-[384px] w-full object-cover"
            loading="lazy"
          />
          {/* <img
            src="tubelight.png"
            alt=""
            className="rounded-xl lg:h-[384px] w-full object-cover"
          /> */}
        </div>
        <div className="lg:w-1/2 lg:pr-6 xl:pr-14 xl:w-[60%] flex flex-col justify-center">
          <div className="box ring-1 ring-[#ECECEC] rounded-md px-6 sm:px-5 lg:px-8 py-6 md:py-8  md:flex items-center">
            <div className="logo flex justify-center md:justify-start items-center mb-5 md:mb-0 md:mr-5 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="size-[44px] text-[#52AF27]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
            </div>
            <div className="right">
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-center md:text-start md:mb-0">
                Tailored for Competitive Success
              </h3>
              <p className="text-center lg:text-start">
                We focus on providing personalized guidance and resources to
                help every student excel in competitive exams.
              </p>
            </div>
          </div>
          <div className="box ring-1 ring-[#ECECEC] rounded-md px-6 sm:px-5 lg:px-8 py-6 md:py-8  md:flex items-center">
            <div className="logo flex justify-center md:justify-start items-center mb-5 md:mb-0 md:mr-5 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="size-[44px] text-[#5C72E8]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
            <div className="right">
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-center md:text-start md:mb-0">
                Expert-Led Learning
              </h3>
              <p className="text-center lg:text-start">
                Our team of experienced educators and mentors ensures
                high-quality content and support, guiding you every step of the
                way.
              </p>
            </div>
          </div>
          <div className="box ring-1 ring-[#ECECEC] rounded-md px-6 sm:px-5 lg:px-8 py-6 md:py-8  md:flex items-center">
            <div className="logo flex justify-center md:justify-start items-center mb-5 md:mb-0 md:mr-5 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="size-[44px] text-[#2EABA4]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
                />
              </svg>
            </div>
            <div className="right">
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-center md:text-start md:mb-0">
                Comprehensive Resources
              </h3>
              <p className="text-center lg:text-start">
                From mock tests to study materials, we offer everything you need
                in one place. Our resources are curated to simplify your
                preparation journey.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:flex justify-center items-center grid-cols-2 py-10 md:grid-cols-4 gap-8 md:gap-24 lg:gap-32 xl:gap-36 md:py-12 lg:py-16">
        <div className="flex justify items-center flex-col">
          <h2 className="text-2xl font-bold text-center lg:text-4xl md:text-3xl">
            200+
          </h2>
          <p className="text-[#989898]">Clients</p>
        </div>
        <div className="flex justify items-center flex-col">
          <h2 className="text-2xl font-bold text-center lg:text-4xl md:text-3xl">
            400+
          </h2>
          <p className="text-[#989898]">Projects</p>
        </div>
        <div className="flex justify items-center flex-col">
          <h2 className="text-2xl font-bold text-center lg:text-4xl md:text-3xl">
            1000+
          </h2>
          <p className="text-[#989898]">Hours of support</p>
        </div>
        <div className="flex justify items-center flex-col">
          <h2 className="text-2xl font-bold text-center lg:text-4xl md:text-3xl">
            7
          </h2>
          <p className="text-[#989898]">workers</p>
        </div>
      </div>
    </section>
  );
}
