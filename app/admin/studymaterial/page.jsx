import React from "react";

export default function studyMaterials() {
  return (
    <div className="bg-zinc-50 h-screen py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl">Study Material</h1>
      </div>
      <button
          className="outline-dashed outline-1 py-1 rounded-sm outline-zinc-400 flex items-center justify-center text-sm w-full"
        >
          {" "}
          <span>+</span>
          Add Column
        </button>
        <button className="bg-primary text-white py-1 px-4 rounded w-fit self-end mt-4">
          Save
        </button>
    </div>
  );
}
