"use client";

import React, { useEffect, useState } from "react";

export default function studyMaterials() {
  const [AllInfos, setAllInfos] = useState(undefined);
  const [render, setRender] = useState(false);

  const getAllInfos = async () => {
    let res = await fetch("http://localhost:3000/api/batch1");
    let data = await res.json();
    setAllInfos(data.data);
  };

  const addFeild = async () => {
    let data = await fetch("http://localhost:3000/api/admin/studymaterial", {
      method: "POST",
    });

    if (data.status == 200) {
      // sucessMsg("feild added sucessfully");
      setRender(!render);
    } else {
      // errorMsg("can not add feild");
    }
  };

  const removeFeild = async (id) => {
    let data = await fetch("http://localhost:3000/api/admin/blogs", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    if (data.status == 200) {
      sucessMsg("feild deleted sucessfully");
      setRender(!render);
    } else {
      errorMsg("can not delete feild");
    }
  };

  const updateTitle = (event, id) => {
    let data = [...blogs];

    let donorIndex = data.findIndex((item) => item._id == id);
    if (donorIndex != -1) {
      data[donorIndex].title = event.target.value;
      setBlogs(data);
    }
  };
  const updateDescription = (event, id) => {
    let data = [...blogs];

    let donorIndex = data.findIndex((item) => item._id == id);
    if (donorIndex != -1) {
      data[donorIndex].description = event.target.value;
      setBlogs(data);
    }
  };
  const updateImageUrl = (event, id) => {
    let data = [...blogs];

    let donorIndex = data.findIndex((item) => item._id == id);
    if (donorIndex != -1) {
      data[donorIndex].imageUrl = event.target.value;
      setBlogs(data);
    }
  };
  const updatePara1 = (event, id) => {
    let data = [...blogs];

    let donorIndex = data.findIndex((item) => item._id == id);
    if (donorIndex != -1) {
      data[donorIndex].para1 = event.target.value;
      setBlogs(data);
    }
  };
  const updatePara2 = (event, id) => {
    let data = [...blogs];

    let donorIndex = data.findIndex((item) => item._id == id);
    if (donorIndex != -1) {
      data[donorIndex].para2 = event.target.value;
      setBlogs(data);
    }
  };
  const updatePara3 = (event, id) => {
    let data = [...blogs];

    let donorIndex = data.findIndex((item) => item._id == id);
    if (donorIndex != -1) {
      data[donorIndex].para3 = event.target.value;
      setBlogs(data);
    }
  };

  const updateRecords = async () => {
    let data = await fetch("http://localhost:3000/api/admin/blogs", {
      method: "PUT",
      body: JSON.stringify({ AllRecords: blogs }),
    });

    if (data.status == 200) {
      sucessMsg("Data updated sucessfully");
    } else {
      errorMsg("can not update data");
    }
  };

  const sucessMsg = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  const errorMsg = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  useEffect(() => {
    getAllInfos();
  }, [render]);



  useEffect(() => {
    getAllInfos();
  }, []);
  return (
    <div className="bg-zinc-50 h-screen py-10 px-4 lg:px-10">
      <div className="mb-6">
        <h1 className="text-xl">Study Material</h1>
      </div>
      {AllInfos ? (
        AllInfos[0].studyMaterial.map((item, index) => (
          <div className=" mt-2 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded flex items-center gap-8" key={index}>
            <div className="hidden md:flex items-center">
              <img src="/pdf-ico.svg" alt="" className="size-12" />
            </div>
            <div className="">
              <h4 className="text-base font-medium">
                {item.title}
              </h4>
              <p className="text-zinc-500 text-sm mt-1">{item.mentor}</p>
            </div>
          </div>
        ))
      ) : (
        <div></div>
      )}
    </div>
  );
}
