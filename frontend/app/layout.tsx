import type { Metadata } from "next";
import { Open_Sans, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider, RoleProvider } from "@/src/providers";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono", 
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EggCoin Agritech DApp",
  description: "Farm-to-table decentralized finance platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${robotoMono.variable} antialiased bg-gradient-to-b from-green-50 to-amber-50`}
      >
        <Web3Provider>
          <RoleProvider>{children}</RoleProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
