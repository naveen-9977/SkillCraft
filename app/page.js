import Image from "next/image";
import Hero from "./components/Hero";
import Clients from "./components/Clients";
import Services from "./components/Services";
import WhyUs from "./components/WhyUs";
import CTA from "./components/CTA";
import Blogs from "./blogs/page";
import BlogsCmp from "./components/Blogs";
import Testimonials from "./components/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Clients/>
      <Services/>
      <WhyUs/>
      <CTA/>
      <BlogsCmp/>
      <Testimonials/>
    </>
  );
}
