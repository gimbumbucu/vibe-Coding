"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopAppBarProps {
  onMenuClick?: () => void;
}

export function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="w-full sticky top-0 bg-surface border-b border-outline-variant z-40">
      <div className="flex items-center justify-between px-md py-sm max-w-[1200px] mx-auto h-16">
        <div className="flex items-center gap-md">
          {pathname === "/" ? (
            <button
              onClick={onMenuClick}
              className="hover:bg-surface-container p-sm rounded-full active:opacity-80 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
          ) : (
            <Link
              href="/"
              className="hover:bg-surface-container p-sm rounded-full active:opacity-80 cursor-pointer transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
          )}
          <Link href="/">
            <h1 className="text-headline-md font-bold text-primary">Memos</h1>
          </Link>
        </div>

        {/* Desktop Search Placeholder */}
        <div className="flex-1 max-w-xl mx-lg hidden md:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-xs pl-12 pr-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-body-md"
              placeholder="Search your memos..."
              type="text"
              readOnly
            />
            {/* Using Link over entire input since prototype separates search page */}
            <Link href="/search" className="absolute inset-0 z-10 cursor-text" />
          </div>
        </div>

        <div className="flex items-center gap-sm">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="hover:bg-surface-container transition-colors p-sm rounded-full cursor-pointer flex items-center justify-center"
            aria-label="Toggle Dark Mode"
          >
            {mounted ? (
              <span className="material-symbols-outlined text-on-surface-variant">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant opacity-0">
                light_mode
              </span>
            )}
          </button>

          {/* Mobile Search Button */}
          <Link
            href="/search"
            className="md:hidden hover:bg-surface-container transition-colors p-sm rounded-full cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
          </Link>

          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border border-outline-variant bg-surface-container-high ml-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
