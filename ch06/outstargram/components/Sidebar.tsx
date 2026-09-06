"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
} from "lucide-react";
import { currentUser } from "@/lib/data";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar() {
  const navItems = [
    { label: "홈", icon: Home, active: true },
    { label: "검색", icon: Search },
    { label: "탐색", icon: Compass },
    { label: "릴스", icon: Film },
    { label: "메시지", icon: MessageCircle, badge: "3" },
    { label: "알림", icon: Heart },
    { label: "만들기", icon: PlusSquare },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-18 xl:w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white p-3 z-30 transition-all duration-200">
      {/* Logo */}
      <div className="pt-6 pb-8 px-3">
        <Link href="/" className="flex items-center gap-3">
          {/* Camera SVG — Instagram-style logo mark */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 flex-shrink-0 xl:hidden text-pink-600"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span className="hidden xl:inline text-2xl font-bold tracking-tight font-serif italic bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent">
            Outstargram
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href="#"
              className={`flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group relative ${
                item.active ? "font-bold" : "font-normal text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                    item.active ? "stroke-[2.5px]" : "stroke-[1.75px]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-base leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile Link */}
        <Link
          href="#"
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden relative ring-2 ring-transparent group-hover:ring-neutral-400 dark:group-hover:ring-neutral-600">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
          <span className="hidden xl:inline text-base leading-none text-neutral-700 dark:text-neutral-300">
            프로필
          </span>
        </Link>
      </nav>

      {/* Bottom Menu */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 space-y-1">
        {/* Theme Toggle */}
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-neutral-700 dark:text-neutral-300">
          <ThemeToggle />
          <span className="hidden xl:inline text-base leading-none">테마 전환</span>
        </div>
        <button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group text-neutral-700 dark:text-neutral-300">
          <Menu className="w-6 h-6 stroke-[1.75px] group-hover:scale-105 transition-transform" />
          <span className="hidden xl:inline text-base leading-none">더 보기</span>
        </button>
      </div>
    </aside>
  );
}
