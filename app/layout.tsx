import { ReactNode } from "react";
import Navbar from "./components/navbar";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Senta",
  description: "Market Sentiment Analysis for Indian Stocks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}><Navbar/>{children}</body>
    </html>
  );
}
