import React from "react";

export default function Blogs() {
  let blogs = [
    {
      tittle: "Boost your conversion rate",
      description:
        "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.",
      imgUrl: "https://hyprland.org/imgs/ricing_competitions/1/amadeus.webp",
      authorName: "Prateek Yadu",
      position: "CEO & Founder",
    },
    // {
    //   tittle: "Boost your conversion rate",
    //   description:
    //     "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.",
    //   imgUrl: "https://hyprland.org/imgs/ricing_competitions/1/flicko.webp",
    //   authorName: "Prateek Yadu",
    //   position: "CEO & Founder",
    // },
  ];
  return (
    <section className="px-4 container m-auto">
      <h3 className="text-center font-bold text-xl lg:text-2xl my-6 md:my-10">
        Blogs
      </h3>
      {blogs.map((blog, index) => (
        <div className="flex flex-col gap-3 md:flex-row " key={index}>
          <div className="md:w-1/3 xl:w-[25%] md:pr-5">
            <img
              src="https://hyprland.org/imgs/ricing_competitions/1/amadeus.webp"
              alt=""
              className="h-[205px] w-full object-cover rounded-lg"
            />
          </div>
          <div className="md:w-2/3 xl:w-[75%] flex  flex-col">
            <h4 className="text-[#393636] font-semibold text-lg mb-2 lg:text-xl">
              {blog.tittle}
            </h4>
            <p className="text-[#676060]">{blog.description}</p>
            <div className="flex items-center gap-3 align-baseline md:mt-7">
              <div className="">
                <img
                  src="https://img.freepik.com/free-photo/indoor-picture-cheerful-handsome-young-man-having-folded-hands-looking-directly-smiling-sincerely-wearing-casual-clothes_176532-10257.jpg?t=st=1731748405~exp=1731752005~hmac=d8372473d961e2b331b26a2eaa4985ef93d4dc07493324923e87bafd6338a29e&w=1380"
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="">
                <h5 className="text-[#393636] text-sm font-semibold">
                  {blog.authorName}
                </h5>
                <p className="text-xs text-[#676060]">{blog.position}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}