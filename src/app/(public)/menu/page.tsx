"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getPublicMenuItems } from "@/lib/api/publicMenu";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1000&auto=format&fit=crop";

type PublicMenuRow = {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  image?: string | null;
  category_name?: string;
  is_available?: boolean;
};

function getImageUrl(image?: string | null): string {
  if (!image) return PLACEHOLDER_IMAGE;
  if (image.startsWith("http")) return image;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8000";
  return `${base}${image}`;
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState<PublicMenuRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const rows = await getPublicMenuItems<PublicMenuRow>();
        setMenuItems(rows);
      } catch (error) {
        console.error("Failed to fetch menu items", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const categoryOptions = useMemo(() => {
    const names = menuItems
      .map((i) => i.category_name)
      .filter((n): n is string => Boolean(n && n.trim()));
    const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b));
    return ["All", ...unique];
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory === "All") return true;
    return item.category_name === activeCategory;
  });

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 mb-2 tracking-tighter">
              Explore Menu
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Curated digital flavors, ready to be prepared.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 bg-white/80 p-2 rounded-2xl border border-slate-200 shadow-sm max-w-full justify-end">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 p-3 rounded-[2.5rem] shadow-sm hover:shadow-lg transition-shadow duration-300 relative group"
              >
                <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-100">
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 pb-1.5 rounded-xl shadow-sm">
                    <span className="text-slate-900 font-black tracking-tight">
                      Rs{item.price}
                    </span>
                  </div>

                  {item.is_available === false && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase shadow-sm">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-3 pb-3">
                  <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight leading-tight truncate">
                    {item.name}
                  </h3>
                  <div className="text-slate-500 text-xs font-medium line-clamp-2 mt-1">
                    {item.description || "Fresh and delicious campus food."}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="text-6xl mb-4 opacity-50">🍽️</div>
            <p className="font-bold uppercase tracking-widest text-sm">
              No items found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
