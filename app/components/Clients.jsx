import React from "react";

export default function Clients() {
  const clients = [
    {
      imageUrl:
        "/1.svg",
    },
    {
      imageUrl:
        "/2.svg",
    },
    {
      imageUrl:
        "/3.svg",
    },
    {
      imageUrl:
        "/4.svg",
    },
    {
      imageUrl:
        "/5.svg",
    },
    {
      imageUrl:
        "/net-armor.svg",
    },
  ];
  return (
    <section className="container m-auto px-4 mb-16">
      <h3 className="text-xl font-semibold text-center py-10 mt-4 md:text-3xl">Companies that have hired from us</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6 justify-center items-center">
        {clients.map((client) => (
          <img src={client.imageUrl} alt="" key={client.imageUrl} className="w-36" />
        ))}
      </div>
    </section>
  );
}
