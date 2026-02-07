import { ReactNode } from "react";
import Navbar from "./components/navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Senta",
  description: "Market Sentiment Analysis for Indian Stocks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
