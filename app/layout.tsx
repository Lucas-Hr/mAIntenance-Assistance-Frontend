import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
} from "next/font/google";

import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Assistant Maintenance",
  description:
    "Assistant de diagnostic technique",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="fr"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${spaceGrotesk.variable}
        h-full
        antialiased
      `}
    >

      <body
        className="
          min-h-full
          flex
          flex-col
          bg-[#F4F6F7]
          text-[#1C2530]
          font-[family-name:var(--font-geist-sans)]
        "
      >

        {children}

      </body>

    </html>
  );
}