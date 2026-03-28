import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomTabBar from "@/components/layout/BottomTabBar";

export const metadata: Metadata = {
  title: "Msell",
  description: "Digital Asset Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          background: "#f6f1e7",
          color: "#16110d",
        }}
      >
        <Header />
        {children}
        <Footer />
        <BottomTabBar />
      </body>
    </html>
  );
}