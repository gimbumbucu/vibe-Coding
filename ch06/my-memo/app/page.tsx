"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { TopAppBar } from "@/components/TopAppBar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { BottomNav } from "@/components/BottomNav";
import { MemoCard } from "@/components/MemoCard";

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const memos = useStore((state) => state.memos);

  return (
    <>
      <TopAppBar onMenuClick={() => setIsDrawerOpen(true)} />
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <main className="flex max-w-[1200px] mx-auto min-h-[calc(100vh-64px)] w-full relative">
        <DesktopSidebar />

        <section className="flex-1 p-md md:p-xl pb-32">
          {/* Content Header */}
          <div className="mb-lg flex items-center justify-between">
            <h2 className="text-headline-lg text-on-background font-bold">Recent Memos</h2>
            <div className="flex gap-sm">
              <button className="flex items-center gap-xs px-md py-xs rounded-full border border-outline-variant hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[20px]">sort</span>
                <span className="text-label-md">Sort</span>
              </button>
              <button className="flex items-center gap-xs px-md py-xs rounded-full border border-outline-variant hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {memos.length > 0 ? (
              memos.map((memo, index) => (
                <MemoCard key={memo.id} memo={memo} featured={index === 0} />
              ))
            ) : (
              <div className="col-span-full py-xl text-center">
                <p className="text-body-lg text-on-surface-variant">No memos found. Create one!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FAB */}
      <Link
        href="/new"
        className="fixed right-lg bottom-[88px] md:bottom-lg h-14 bg-primary text-on-primary rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50 group px-md"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
        <span className="text-label-md ml-2 pr-2 font-bold">New Memo</span>
      </Link>

      <BottomNav />
    </>
  );
}
