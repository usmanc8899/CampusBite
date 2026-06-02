"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaGraduationCap, FaUtensils, FaClock, FaCreditCard, FaChevronRight, FaGooglePlay, FaSearch, FaMobileAlt, FaBoxOpen } from "react-icons/fa";
import QRCodeGenerator from "@/components/public/QRCodeGenerator";

export default function LandingPage() {
  const downloadUrl = "https://pub-dc64bbbe864b4f79b3fdd114bf9d76b3.r2.dev/apk/app-release.apk";

  return (
    <>
      {/* Hero Section */}
      <main className="pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 text-orange-600 text-[13px] font-bold mb-6 border border-orange-200/50 uppercase tracking-widest drop-shadow-sm">
                <span className="text-base">🍔</span> Fresh & Fast
              </div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] text-slate-900">
                Delicious food, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-primary">
                  zero wait time.
                </span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                CampusBite brings your favorite cafeteria meals straight to you. 
                Order ahead, skip the long queues, and fuel your day perfectly.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Link
                  href="/download"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white transition-all bg-slate-900 hover:bg-slate-800 rounded-full shadow-xl hover:-translate-y-0.5"
                >
                  Get the App <FaChevronRight className="ml-2 w-3 h-3" />
                </Link>
                <Link
                  href="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-bold text-slate-700 transition-colors bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full shadow-sm"
                >
                  Learn More
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative shadow-sm">
                      <Image 
                        src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                        alt="User" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-left leading-tight">
                  <div className="flex text-warning text-sm mb-0.5">★★★★★</div>
                  <div className="text-xs font-bold text-slate-600">Loved by 10k+ students</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="flex-1 w-full relative max-w-lg lg:max-w-none mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-primary/20 rounded-[3rem] transform rotate-3 scale-105 blur-xl -z-10" />
              
              <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-slate-100">
                <Image
                  src="/dummy.webp"
                  alt="Delicious Campus Burger"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                <motion.div 
                   animate={{ y: [0, -8, 0] }}
                   transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,1)] animate-pulse"></div>
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-sm leading-none mb-1">Order Ready!</div>
                      <div className="text-slate-500 font-medium text-[11px]">Pick up at Counter 3</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Time</div>
                    <div className="text-slate-900 font-black text-sm">12:30 PM</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Simple Process</div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">How CampusBite Works</h2>
            <p className="text-slate-500 text-base font-medium">Ordering food on campus has never been easier. Just follow these three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-slate-200 via-primary/30 to-slate-200 z-0 text-transparent">_</div>
            
            <div className="relative z-10 flex flex-col items-center text-center group">
               <div className="w-24 h-24 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                 <FaSearch size={32} className="text-orange-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">1. Find Your Craving</h3>
               <p className="text-slate-500 font-medium text-sm">Browse the digital menu covering all major campus cafeterias instantly.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
               <div className="w-24 h-24 rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                 <FaMobileAlt size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">2. Order Ahead</h3>
               <p className="text-slate-500 font-medium text-sm">Customize your meal and pay digitally. Skip the lines completely.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
               <div className="w-24 h-24 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                 <FaBoxOpen size={32} className="text-emerald-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">3. Pick Up Fast</h3>
               <p className="text-slate-500 font-medium text-sm">Grab your hot food right from the pickup counter exactly when it's ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-24 bg-white relative z-20 border-t border-slate-100 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 opacity-[0.03] pointer-events-none rounded-full overflow-hidden blur-[2px]">
          <Image src="/dummy.webp" alt="Pizza bg" fill className="object-cover"/>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">Everything you need for dining</h2>
            <p className="text-slate-500 text-base lg:text-lg font-medium leading-relaxed">
              Designed specifically to make university life slightly more delicious and infinitely less stressful.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<FaClock className="w-6 h-6 text-orange-500" />}
              title="Skip the Lines"
              desc="Order ahead and pick up exactly when your food is hot and ready. Never wait again."
              colorClass="bg-orange-50"
            />
            <FeatureCard 
              icon={<FaUtensils className="w-6 h-6 text-primary" />}
              title="Campus Wide"
              desc="Delivery anywhere on campus—the library, specific dorms, or even the quad."
              colorClass="bg-blue-50"
            />
            <FeatureCard 
              icon={<FaGraduationCap className="w-6 h-6 text-purple-500" />}
              title="Faculty Perks"
              desc="Special priority queues and dedicated billing systems tailored for faculty members."
              colorClass="bg-purple-50"
            />
            <FeatureCard 
              icon={<FaCreditCard className="w-6 h-6 text-success" />}
              title="Easy Payments"
              desc="Pay conveniently direct billing, or standard cash payment."
              colorClass="bg-emerald-50"
            />
          </div>
        </div>
      </section>

      {/* Download Section Refined with 3 Mobile Frames overlapping */}
      <section className="py-20 lg:py-28 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 object-cover pointer-events-none">
          <Image src="/dummy.webp" fill alt="Food Flatlay background" className="object-cover" />
          <div className="absolute inset-0 bg-slate-900/90 mix-blend-multiply"></div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-lg lg:max-w-none mx-auto text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight leading-tight">
              Get the <br /> <span className="text-primary drop-shadow-md">CampusBite</span> App
            </h2>
            <p className="text-lg text-slate-300 font-medium mb-8 leading-relaxed max-w-sm mx-auto lg:mx-0">
              Unlock exclusive deals, track orders in real-time, and get food faster directly from your pocket.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {/* Removed Apple button, kept only Android link */}
              <button className="flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-colors shadow-lg">
                <FaGooglePlay size={24} className="text-green-500" />
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Get it for</div>
                  <div className="text-base tracking-tight leading-none pt-0.5">Android Device</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-center w-full relative pt-10 lg:pt-0">
            {/* 3-Phone Composition Frame */}
            <div className="relative w-full max-w-[400px] aspect-[4/5] flex items-center justify-center mt-6 lg:mt-0">
              
              {/* Left Mockup App Screen */}
              <div className="absolute w-[180px] h-[360px] md:w-[200px] md:h-[400px] bg-white rounded-[2rem] shadow-xl border-[6px] border-slate-100/10 overflow-hidden transform -rotate-12 -translate-x-12 md:-translate-x-16 opacity-60 z-0">
                 <Image src="/a.jpeg" alt="App UI 1" fill className="object-cover" />
              </div>
              
              {/* Right Mockup App Screen */}
              <div className="absolute w-[180px] h-[360px] md:w-[200px] md:h-[400px] bg-white rounded-[2rem] shadow-xl border-[6px] border-slate-100/10 overflow-hidden transform rotate-12 translate-x-12 md:translate-x-16 opacity-60 z-0">
                 <Image src="/b.jpeg" alt="App UI 2" fill className="object-cover" />
              </div>

              {/* Center Front Phone */}
              <div className="absolute w-[200px] h-[400px] md:w-[220px] md:h-[440px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-slate-100/20 overflow-hidden z-20">
                 <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-3 bg-slate-900 rounded-full z-10"></div>
                 <Image src="/m.jpeg" alt="App UI 3" fill className="object-cover" />
              </div>

              {/* Floating QR Code Label */}
              <div className="absolute -bottom-8 -left-4 md:-left-8 z-30 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center">
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Scan to App</span>
                <div className="bg-slate-50 p-1.5 rounded-xl">
                  <QRCodeGenerator url={downloadUrl} size={80} className="shadow-none border-none p-0 !bg-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon, title, desc, colorClass }: { icon: React.ReactNode, title: string, desc: string, colorClass: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 group">
      <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-inner`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
