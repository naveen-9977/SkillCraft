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
  const pathname = usePathname();
  
  // This condition checks if the current path is NOT a dashboard, admin, or mentor page.
  const showNavAndFooter = !pathname.startsWith("/dashboard") && !pathname.startsWith("/admin") && !pathname.startsWith("/mentor");

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {showNavAndFooter && <Navbar/> }
        <div className="">{children}</div>
        {showNavAndFooter && <Footer/> }
      </body>
    </html>
  );
}