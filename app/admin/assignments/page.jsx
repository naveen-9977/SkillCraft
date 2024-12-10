"use client";

import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { HiOutlineChevronDown } from "react-icons/hi2";

export default function AnnouncementsPage() {
  const [AllInfos, setAllInfos] = useState(undefined);

  const getAllInfos = async () => {
    let res = await fetch("http://localhost:3000/api/batch1");
    let data = await res.json();
    setAllInfos(data.data);
  };

  const updateTitle = (event, index) => {
    let data = [...AllInfos];
    data[0].assignments[index].title = event.target.value;
    setAllInfos(data);
  };

  const updateMentor = (event, index) => {
    let data = [...AllInfos];
    data[0].assignments[index].mentor = event.target.value;
    setAllInfos(data);
  };

  const updateResourceUrl = (event, index) => {
    let data = [...AllInfos];
    data[0].assignments[index].resourceUrl = event.target.value;
    setAllInfos(data);
  };

  const updateResourceType = (event, index) => {
    let data = [...AllInfos];
    data[0].assignments[index].resourceType = event.target.value;
    setAllInfos(data);
  };

  const updateData = async () => {
    let res = await fetch("http://localhost:3000/api/admin/assignments", {
      method: "POST",
      body: JSON.stringify({
        id: AllInfos[0]._id,
        AllData: AllInfos[0].assignments,
      }),
    });
  };

  const deleteElement = (index) => {
    let data = [...AllInfos];
    data[0].assignments.splice(index, 1);
    setAllInfos(data);
  };

  const AddElement = (index) => {
    let data = [...AllInfos];
    data[0].assignments.push({
      title: "Add Title",
      mentor: "Add mentor",
      resourceUrl: "Add resource Url",
      resourceType: "Add resource Type",

    });
    setAllInfos(data);
  };

  useEffect(() => {
    getAllInfos();
  }, []);

  return (
    <div className="bg-zinc-50 py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl font-semibold mb-4">Asignments</h1>
        <div className="faqs flex flex-col gap-6">
          {AllInfos &&
            AllInfos[0].assignments.map((item, index) => (
              <details
                className="group border-b-[1px] py-4 border-zinc-300 w-full cursor-pointer"
                key={index}
                open
              >
                <summary className="text-zinc-900 flex items-center justify-between gap-2">
                  <div className="left font-semibold text-xl">{item.title}</div>
                  <div className="right flex items-center gap-4">
                    <button className="text-red-600">
                      <MdDelete size={20} onClick={() => {
                            deleteElement(index)
                      }} />
                    </button>
                    <div className="group-open:rotate-180 flex gap-2">
                      <HiOutlineChevronDown size={26} />{" "}
                    </div>
                  </div>
                </summary>
                <div className="faq flex flex-col my-2">
                  <label htmlFor="title">
                    <div className="py-2 flex items-center justify-between">
                      Title{" "}
                    </div>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="px-2 rounded-sm outline-none ring-1 ring-zinc-400 w-full"
                      value={item.title}
                      onChange={(e) => {
                        updateTitle(e, index);
                      }}
                    />
                  </label>
                  <label htmlFor="description">
                    <div className="block py-2">Mentor</div>
                    <input
                      type="text"
                      name="description"
                      id="description"
                      className="px-2 rounded-sm outline-none ring-1 ring-zinc-400 w-full"
                      value={item.mentor}
                      onChange={(e) => {
                        updateMentor(e, index);
                      }}
                    />
                  </label>
                  <label htmlFor="imageUrl">
                    <div className="block py-2">Resource Url</div>
                    <input
                      type="text"
                      name="imageUrl"
                      id="imageUrl"
                      className="px-2 rounded-sm outline-none ring-1 ring-zinc-400 w-full"
                      value={item.resourceUrl}
                      onChange={(e) => {
                        updateResourceUrl(e, index);
                      }}
                    />
                  </label>
                  <label htmlFor="ResourceType">
                    <div className="block py-2">Resource Type</div>
                    <input
                      type="text"
                      name="ResourceType"
                      id="ResourceType"
                      className="px-2 rounded-sm outline-none ring-1 ring-zinc-400 w-full"
                      value={item.resourceType}
                      onChange={(e) => {
                        updateResourceType(e, index);
                      }}
                    />
                  </label>
                </div>
              </details>
            ))}
        </div>
        <button className="outline-dashed outline-1 py-1 rounded-sm outline-zinc-400 flex items-center justify-center text-sm w-full" onClick={()=>{
          AddElement()
        }}>
          {" "}
          <span>+</span>
          Add Column
        </button>
        <button
          className="bg-primary text-white py-1 px-4 rounded w-fit self-end mt-4"
          onClick={() => {
            updateData();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
