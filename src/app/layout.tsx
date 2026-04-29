import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "AI Storytelling Resume Builder",
  description: "Turn work history into STAR-powered, ATS-friendly stories."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} min-h-screen`}>
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}

