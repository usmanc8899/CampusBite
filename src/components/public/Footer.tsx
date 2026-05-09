import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="CampusBite Logo"
                width={160}
                height={50}
                className="object-contain" // Preserved original clear logo colors
              />
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
              The ultimate university cafeteria ordering system. Skip the lines and enjoy your meals hassle-free.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 font-black mb-6 text-lg tracking-tight">Product</h3>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-500">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/download" className="hover:text-primary transition-colors">Download App</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/menu" className="hover:text-primary transition-colors">Menu</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-slate-900 font-black mb-6 text-lg tracking-tight">Legal</h3>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-500">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Management (Moved from header) */}
          <div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-slate-900 font-black mb-4 tracking-tight">Management Portal</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">For authorized university staff and cafeteria owners only.</p>
              <ul className="flex flex-col gap-3 text-sm font-bold text-slate-600">
                <li><Link href="/login" className="flex items-center gap-2 hover:text-primary transition-colors">→ Staff Login</Link></li>
                <li><Link href="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors">→ Admin Dashboard</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm mt-12 text-slate-400 font-medium">
          <p>© {currentYear} CampusBite Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
