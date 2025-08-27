"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../style/Hero.css"; 

const carouselImages = ["/front2.jpg", "/front2.jpg", "/front3.jpg", "/front1.png"];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 4000); 

    return () => {
      clearInterval(timer);
    };
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));

  return (
    <section className="hero-section">
      <div className="hero-carousel">
        {carouselImages.map((img, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="carousel-navigation">
        <button onClick={prevSlide} className="nav-btn"><FaChevronLeft /></button>
        <button onClick={nextSlide} className="nav-btn"><FaChevronRight /></button>
      </div>

      {/* The color classes have been updated in this div */}
      <div className="md:w-1/2 md:flex flex-col justify-center lg:pr-10 xl:pr-16 relative z-10 p-4">
        <span className="text-xs bg-teal-500/[13%] text-teal-300 px-3 py-1 rounded-full font-medium w-fit">
          Your Future, Our Craft
        </span>
        <h2 className="text-2xl font-semibold mt-2 lg:text-4xl lg:mt-4 text-white">
          Personalized Learning to Empower Your Growth
        </h2>
        {/* Changed text-zinc-500 to text-gray-200 for better readability on dark background */}
        <p className="text-gray-200 mt-3 lg:mt-5 lg:text-lg">
          At SkillCrafters, we believe in unlocking your true potential through
          expert mentorship, innovative teaching methods, and tailored learning
          paths. Whether you aim to excel academically, enhance your
          professional skills, or explore new opportunities, we are here to
          guide you every step of the way. Browse our diverse range of{" "}
          <Link href={"/"} className="text-teal-400 hover:underline">courses </Link>
          or <Link href={"/"} className="text-teal-400 hover:underline">contact us</Link> today to start
          crafting your path to success with SkillCrafters.
        </p>
        <Link href={"/login"} className="mt-10 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded w-fit">
          Get Started
        </Link>
      </div>
    </section>
  );
}