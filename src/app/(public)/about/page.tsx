import React from "react";
import Image from "next/image";
import { FaMapMarkerAlt, FaUsers, FaLeaf, FaClock, FaHeart, FaShieldAlt } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[13px] font-bold mb-4 border border-primary/20 uppercase tracking-widest">
            Who We Are
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Revolutionizing campus dining, <br className="hidden md:block"/> one meal at a time.
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            CampusBite was founded by students who were tired of spending half their lunch break waiting in queues. Today, we power over 20 cafeterias with perfect timing and zero cold food.
          </p>
        </div>

        {/* Bento Grid Layout (Original) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Main Large Bento Item (Story) */}
          <div className="md:col-span-2 relative bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 min-h-[400px] group">
            <Image 
              src="/dummy.webp" 
              alt="Students eating" 
              fill 
              className="object-cover transition-transform duration-[20s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Our Mission</h2>
              <p className="text-slate-200 font-medium max-w-xl text-sm leading-relaxed">
                We believe that every university campus should run smoothly with integrated dining tools—predicting demand using AI, preventing food waste, and giving students more time to focus on what matters most: their education and campus life.
              </p>
            </div>
          </div>

          {/* Stats Bento Items */}
          <div className="flex flex-col gap-6">
            <div className="bg-primary rounded-[2rem] p-8 text-white shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute -top-6 -right-6 text-white/10">
                 <FaUsers size={120} />
               </div>
               <div className="relative z-10">
                 <div className="text-5xl font-black mb-2">50k+</div>
                 <div className="font-bold text-primary-100 uppercase tracking-widest text-xs">Students Served</div>
               </div>
            </div>
            
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute -bottom-4 -right-4 text-slate-50">
                 <FaMapMarkerAlt size={100} />
               </div>
               <div className="relative z-10">
                 <div className="text-4xl font-black text-slate-900 mb-2">20+</div>
                 <div className="font-bold text-slate-500 uppercase tracking-widest text-xs">Partnered Sites</div>
               </div>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Our Core Values</h2>
            <p className="text-slate-500 text-base font-medium">Built deeply on trust, sustainability, and time efficiency.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
                <FaLeaf size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Sustainability First</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                By accurately forecasting cafeteria demand, we heavily reduce daily food waste across campus dining centers.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
                <FaClock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Time Efficiency</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Your break should be spent relaxing, not standing. Our AI routing cuts wait times by an average of 15 minutes.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                <FaHeart size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Student Focused</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                We continuously solicit feedback to ensure our features are perfectly aligned with real university life experiences.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
