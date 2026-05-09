import React from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Optional: If you want background gradients to persist across public pages
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-primary selection:text-white relative overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full z-10">{children}</main>
      <Footer />
    </div>
  );
}
