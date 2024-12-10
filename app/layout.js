"use client"

import { usePathname } from "next/navigation";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import "./style/globals.css";
import { Poppins, Red_Hat_Display, Inter } from "next/font/google";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
});
const inter = Inter({
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  const pathname= usePathname()
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {!pathname.startsWith("/dashboard") && !pathname.startsWith("/admin") && <Navbar/> }
        {/* <Navbar/> */}
        <div className="">{children}</div>
        {!pathname.startsWith("/dashboard") && !pathname.startsWith("/admin") && <Footer/> }
      </body>
    </html>
  );
}
