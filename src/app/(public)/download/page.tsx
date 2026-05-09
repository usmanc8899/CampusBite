"use client";

import React from "react";
import QRCodeGenerator from "@/components/public/QRCodeGenerator";
import { FaGooglePlay, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";

export default function DownloadPage() {
  const downloadUrl = "https://campusbite.com/app.apk"; // Point to the generic APK / download link

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Text and Buttons */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-2xl text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-6">
            📱 Official App Download
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Order food in <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              a few taps.
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
            Scan the QR code to instantly download the latest CampusBite app on your preferred Android device. Never wait in the cafeteria lines again.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10">
            {/* iOS button removed as requested */}
            <button className="flex items-center justify-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-2xl">
              <FaGooglePlay size={32} className="text-green-400" />
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-400">GET IT FOR</div>
                <div className="text-lg tracking-tight pt-0.5">Android APK</div>
              </div>
            </button>
          </div>


        </motion.div>

        {/* Right Side: 3-Mobile Frame QR Composition */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex justify-center w-full relative pt-10 lg:pt-0"
        >
          {/* Mockup Frame Container */}
          <div className="relative w-full max-w-[400px] aspect-[4/5] flex items-center justify-center mt-10">
             
            {/* Background Left Phone */}
            <div className="absolute w-[200px] h-[400px] bg-white rounded-[2rem] shadow-xl border-[6px] border-slate-100 overflow-hidden transform -rotate-12 -translate-x-16 opacity-80 z-0 hover:rotate-0 hover:-translate-y-4 hover:opacity-100 hover:z-30 transition-all duration-300 cursor-pointer">
               <Image src="https://images.unsplash.com/photo-1512413515086-9ac6b162fb24?q=80&w=700&auto=format&fit=crop" alt="App screen 1" fill className="object-cover" />
            </div>
            {/* Background Right Phone */}
            <div className="absolute w-[200px] h-[400px] bg-white rounded-[2rem] shadow-xl border-[6px] border-slate-100 overflow-hidden transform rotate-12 translate-x-16 opacity-80 z-0 hover:rotate-0 hover:-translate-y-4 hover:opacity-100 hover:z-30 transition-all duration-300 cursor-pointer">
               <Image src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=700&auto=format&fit=crop" alt="App screen 2" fill className="object-cover" />
            </div>

            {/* Center Front Phone */}
            <div className="absolute w-[220px] h-[440px] bg-white rounded-[2rem] shadow-2xl border-[6px] border-slate-100 overflow-hidden z-20 hover:-translate-y-4 transition-all duration-300 cursor-pointer">
               <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900 rounded-full z-10"></div>
               <Image src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=700&auto=format&fit=crop" alt="App screen 3" fill className="object-cover" />
            </div>

            {/* Floating QR Code Badge */}
            <div className="absolute -bottom-4 -left-4 md:-left-12 z-30 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Scan Now</span>
              <div className="bg-slate-50 p-2 rounded-2xl">
                <QRCodeGenerator url={downloadUrl} size={100} className="shadow-none border-none p-0 !bg-transparent" />
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
