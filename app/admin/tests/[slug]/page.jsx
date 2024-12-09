import Link from "next/link";
import React from "react";

export default function TestPage() {
  return (
    <div className="flex flex-col">
      <div className="py-4 flex items-center justify-between border-b-[1px] border-zinc-200 px-4 lg:px-10 bg-white">
        <ul className="flex items-center gap-5">
          <li className="text-zinc-600">Question 1</li>
        </ul>
      </div>
      <div className=" px-4">
        <div className="bg-white px-4 border-[1px] border-zinc-200 rounded my-6 py-4">
          <h4 className="md:text-lg font-medium">
            What is the most used javascript framework
          </h4>
          <h5 className="font-bold text-sm mt-4 mb-2 md:text-base">
            Conclusion:-
          </h5>
          <ol className="list-[lower-alpha] list-inside flex flex-col gap-1">
            <li className="">Angular</li>
            <li className="">Express</li>
            <li className="">Svelte</li>
            <li className="">React</li>
          </ol>
          <div className="flex flex-col gap-2 mt-12">
            <p className="flex flex-col py-2 px-4 rounded font-semibold text-zinc-800">
              a
            </p>
            <p className="flex flex-col py-2 px-4 rounded font-semibold text-white bg-green-600">
              b
            </p>
            <p className="flex flex-col py-2 px-4 rounded font-semibold text-zinc-800">
              c
            </p>
            <p className="flex flex-col py-2 px-4 rounded font-semibold text-zinc-800">
              d
            </p>
          </div>
          <div className="mt-12 flex justify-between items-center">
            <Link href={"/"} className="text-primary px-4 py-1 rounded">&larr; Previous</Link>
            <Link href={"/"} className="bg-primary text-white px-4 py-1 rounded">Next &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
