"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Search,
  Compass,
  Heart,
  PlusSquare,
  MessageCircle,
} from "lucide-react";
import { currentUser } from "@/lib/data";
import ThemeToggle from "@/components/ThemeToggle";

export default function MobileNav() {
  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 z-40">
        <span className="text-xl font-bold tracking-tight font-serif italic bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent">
          Outstargram
        </span>

        <div className="flex items-center gap-3 text-black dark:text-white">
          <ThemeToggle />
          <button className="relative p-1">
            <Heart className="w-6 h-6 stroke-[1.75px]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="relative p-1">
            <MessageCircle className="w-6 h-6 stroke-[1.75px]" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-2 z-40 text-black dark:text-white">
        <Link href="#" className="p-2">
          <Home className="w-6 h-6 stroke-[2.5px]" />
        </Link>
        <Link href="#" className="p-2">
          <Search className="w-6 h-6 stroke-[1.75px]" />
        </Link>
        <Link href="#" className="p-2">
          <PlusSquare className="w-6 h-6 stroke-[1.75px]" />
        </Link>
        <Link href="#" className="p-2">
          <Compass className="w-6 h-6 stroke-[1.75px]" />
        </Link>
        <Link href="#" className="p-1">
          <div className="w-6 h-6 rounded-full overflow-hidden relative border border-neutral-300 dark:border-neutral-700">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
        </Link>
      </nav>
    </>
  );
}
