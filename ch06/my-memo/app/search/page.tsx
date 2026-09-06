"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(["Project X", "Grocery list", "Meeting notes"]);

  const clearAll = () => {
    setRecentSearches([]);
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Top Search Bar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-ui border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-md py-sm flex items-center gap-md">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors cursor-pointer active:opacity-80"
          >
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          
          <div className="flex-1 flex items-center bg-surface-container-low rounded-full px-md py-xs border border-transparent focus-within:border-primary focus-within:bg-surface-container-lowest transition-all group">
            <input
              autoFocus
              className="w-full bg-transparent border-none focus:ring-0 text-body-md py-1 placeholder:text-on-surface-variant/60"
              placeholder="Search memos..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={() => setQuery("")}
              className={`flex items-center justify-center transition-opacity ${query ? "opacity-100" : "opacity-0"}`}
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-md pt-lg">
        {/* Recent Searches */}
        <section className="mb-xl">
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-headline-md font-bold text-on-surface">Recent Searches</h2>
            <button
              onClick={clearAll}
              className="text-label-sm font-bold text-primary hover:underline transition-all cursor-pointer active:scale-95"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-base transition-all">
            {recentSearches.length > 0 ? (
              recentSearches.map((term) => (
                <div key={term} className="flex items-center justify-between p-md rounded-xl hover:bg-surface-container-high transition-all cursor-pointer active:scale-[0.98]">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant/60">history</span>
                    <span className="text-body-md text-on-surface">{term}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">north_west</span>
                </div>
              ))
            ) : (
              <div className="p-md text-center text-on-surface-variant/60 text-body-md italic">
                No recent searches
              </div>
            )}
          </div>
        </section>

        {/* Suggested Tags */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-md">Suggested Tags</h2>
          <div className="flex flex-wrap gap-sm">
            <button className="inline-flex items-center bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container px-md py-sm rounded-full transition-all active:scale-95">
              <span className="text-label-md">#Work</span>
            </button>
            <button className="inline-flex items-center bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-md py-sm rounded-full transition-all active:scale-95">
              <span className="text-label-md">#Personal</span>
            </button>
            <button className="inline-flex items-center bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-md py-sm rounded-full transition-all active:scale-95">
              <span className="text-label-md">#Ideas</span>
            </button>
            <button className="inline-flex items-center bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-md py-sm rounded-full transition-all active:scale-95">
              <span className="text-label-md">#Archive</span>
            </button>
            <button className="inline-flex items-center bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-md py-sm rounded-full transition-all active:scale-95">
              <span className="text-label-md">#Travel</span>
            </button>
          </div>
        </section>

        {/* Visual Decorative Area */}
        <section className="mt-xl opacity-40">
          <div className="p-xl border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md">manage_search</span>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              Try searching for keywords, dates, or tags to find your memos quickly.
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
