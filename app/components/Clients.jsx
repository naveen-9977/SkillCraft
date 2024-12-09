import React from "react";

export default function Clients() {
  const clients = [
    {
      imageUrl:
        "https://tailwindui.com/plus/img/logos/158x48/transistor-logo-gray-900.svg",
    },
    {
      imageUrl:
        "https://tailwindui.com/plus/img/logos/158x48/reform-logo-gray-900.svg",
    },
    {
      imageUrl:
        "https://tailwindui.com/plus/img/logos/158x48/tuple-logo-gray-900.svg",
    },
    {
      imageUrl:
        "https://tailwindui.com/plus/img/logos/158x48/statamic-logo-gray-900.svg",
    },
    {
      imageUrl:
        "https://tailwindui.com/plus/img/logos/laravel-logo-gray-900.svg",
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
