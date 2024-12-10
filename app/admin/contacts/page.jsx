"use client";

import { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { TiTick } from "react-icons/ti";

export default function AdminContactPage() {
  const [contact, setContact] = useState([]);
  const [render, setRender] = useState(false);

  const getAllContact = async () => {
    let res = await fetch("http://localhost:3000/api/admin/contact");
    let data = await res.json();
    setContact(data.data);
  };

  const updateStatus = async (id, action) => {
    let string = JSON.stringify({id:id, action: action})
    console.log(string)
    let res = await fetch("http://localhost:3000/api/admin/contact",{
      method: "POST",
      body: string
    });
    if(res.status == 200){
      setRender(!render)
    }
  };

  const deleteItem = async (index) => {
    let newData = [...contact];
    // newData.splice(index, 1)

    let data = await fetch("http://localhost:3000/api/admin/contact", {
      method: "DELETE",
      body: JSON.stringify({ id: newData[index]._id }),
    });

    if (data.status == 200) {
      setRender(!render);
    } else {
    }
  };

 

  function dateGiver(date){

    let data = date.split("-")

    let newdate = data[2].substring(0,2)+"/"+data[1]+"/"+data[0]

    return newdate
  }

  useEffect(() => {
    getAllContact();
  }, [render]);

  return (
    <>     
      <div className="md:px-4">
        <div className="container m-auto my-2 px-4 md:px-0">
          <div className="heading font-semibold text-3xl text-center mb-8">
            All Enquiries
          </div>
          <div className="data my-4 text-zinc-800 flex flex-col gap-4">
            {contact.length >= 0 &&
              contact.map((item, index) => (
                <div
                  className={`box flex flex-col ring-1 py-2 px-2 sm:px-4 md:py-4 ring-zinc-300 rounded-lg ${item.actionTaken && "bg-green-50 ring-green-600"}`}
                key={index}>
                  <div className="top flex flex-col mb-4">
                    <div className="localty text-xl font-semibold flex items-center justify-between">
                      Name: {item.firstName}
                      <div className="btns flex items-center justify-center gap-4">
                        <button className="" onClick={()=>{
                          updateStatus(item._id, item.actionTaken)
                        }}>
                          <TiTick size={25}/>
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => {
                            deleteItem(index);
                          }}
                        >
                          <MdDelete size={25} />
                        </button>
                      </div>
                    </div>
                    <div className="">requested at: <span className="font-bold">{dateGiver(item.createdAt)}</span></div>
                  </div>
                  <div className="mid flex flex-col">
                    <div className="name text-zinc-600">
                      Email:{" "}
                      <span className="text-zinc-600 font-bold">
                        {item.email}
                      </span>
                    </div>{" "}
                    <div className="age text-zinc-600">
                      Phone Number: {item.phone}
                    </div>{" "}
                  </div>
                  <div className="bottom mt-2 flex flex-col gap-1">
                    <div className="available-blood text-zinc-600 ">
                      Message:{" "}
                      <span className="text-zinc-600 font-bold">
                        {item.message}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
