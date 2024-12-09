import React from "react";

export default function About() {
  return (
    <main>
      <section className="px-4 container m-auto">
        <h3 className="text-center font-bold text-xl lg:text-2xl my-6 md:my-10">
          About Us
        </h3>

        <div className="grid lg:grid-cols-2 overflow-hidden gap-12 xl:gap-x-6 ">
          <div className="">
            <h3 className="font-bold text-xl md:text-2xl mt-0">
              Our Mission
            </h3>
            <div className="flex w-full justify-start items-center mb-4">
              <span className="w-[88px] h-1 bg-primary block rounded-full"></span>
            </div>
            <p className=" py-2">
              Our mission is to provide exceptional camping and adventure
              experiences that foster a deep connection with nature, inspire
              personal growth, and create lasting memories for our clients.
            </p>
            <p className=" py-2">
              We strive to offer safe, sustainable, and high-quality outdoor
              experiences that leave a positive impact on the environment and
              local communities. Through our services, we aim to cultivate a
              love for the great outdoors, promote physical and mental wellness,
              and encourage a sense of adventure and exploration.
            </p>
          </div>
          <div className="">
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt=""
              className="h-[340px] w-full object-cover rounded"
            />
          </div>
          <div className="">
            <h3 className="font-bold text-xl md:text-2xl mt-4">
              Extraordinary Experiences
            </h3>
            <div className="flex w-full justify-start items-center mb-4">
              <span className="w-[88px] h-1 bg-primary block rounded-full"></span>
            </div>
            <p className=" py-2">
              We Offer unique and diverse experiences: Provide a range of
              outdoor activities that cater to different interests and skill
              levels. This can include hiking, rock climbing, kayaking, rafting,
              camping, and more. Offer customized packages that allow clients to
              choose the activities they are most interested in. We ensure that
              the equipment and gear provided to clients are of the highest
              quality and are well-maintained. We emphasize sustainability by
              promoting Leave No Trace principles and implementing eco-friendly
              practices.
            </p>
          </div>
          <div className="">
            <h3 className="font-bold text-xl md:text-2xl mt-4">
              Our Core Values
            </h3>
            <div className="flex w-full justify-start items-center mb-4">
              <span className="w-[88px] h-1 bg-primary block rounded-full"></span>
            </div>
            <p className=" py-2">
              Here are our core values that we believe in:
            </p>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-4">
                <span className="h-1 bg-primary w-[8%] sm:w-[4%] lg:w-[6%] xl:w-[4%] rounded-full"></span>
                <span className="w-[92%] sm:w-[96%] lg:w-[94%] xl:w-[96%]">
                  Prioritizing the safety of clients and staff in all activities
                  and operations.
                </span>
              </p>
              <p className="flex items-center gap-4">
                <span className="h-1 bg-primary w-[8%] sm:w-[4%] lg:w-[6%] xl:w-[4%] rounded-full"></span>
                <span className="w-[92%] sm:w-[96%] lg:w-[94%] xl:w-[96%]">
                  Providing genuine, unique, and immersive outdoor experiences
                  that reflect local culture and environment.
                </span>
              </p>
              <p className="flex items-center gap-4">
                <span className="h-1 bg-primary w-[8%] sm:w-[4%] lg:w-[6%] xl:w-[4%] rounded-full"></span>
                <span className="w-[92%] sm:w-[96%] lg:w-[94%] xl:w-[96%]">
                  Encouraging and facilitating learning opportunities related to
                  the natural world, outdoor skills, and personal development.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
