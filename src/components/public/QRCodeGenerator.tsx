"use client";

import React from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ url, size = 200, className = "" }: QRCodeGeneratorProps) {
  // We use a slight animation to make the QR feeling snappy when it updates
  return (
    <motion.div
      key={url}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center ${className}`}
    >
      <div className="relative">
        {url ? (
          <QRCode
            value={url}
            size={size}
            level="H" // High error correction
            bgColor="#ffffff"
            fgColor="#0f172a" // slate-900
            className="rounded-xl"
          />
        ) : (
          <div 
            className="bg-slate-50 flex items-center justify-center rounded-xl text-slate-400 text-sm text-center p-4 border border-dashed border-slate-200"
            style={{ width: size, height: size }}
          >
            Enter a URL to generate QR
          </div>
        )}
      </div>
    </motion.div>
  );
}
