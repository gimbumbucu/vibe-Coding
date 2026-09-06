"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav on new/edit pages
  if (pathname.startsWith("/new") || pathname.startsWith("/edit")) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface shadow-[0_-2px_4px_rgba(0,0,0,0.04)] border-t border-outline-variant/30 h-16 flex justify-around items-center px-gutter">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center rounded-full px-lg py-xs active:scale-95 transition-all duration-150 ${
          pathname === "/"
            ? "bg-secondary-container text-on-secondary-container"
            : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={pathname === "/" ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          description
        </span>
        <span className="text-label-sm mt-1">Notes</span>
      </Link>

      <Link
        href="/search"
        className={`flex flex-col items-center justify-center rounded-full px-lg py-xs active:scale-95 transition-all duration-150 ${
          pathname === "/search"
            ? "bg-secondary-container text-on-secondary-container"
            : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={pathname === "/search" ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          search
        </span>
        <span className="text-label-sm mt-1">Search</span>
      </Link>

      <button className="flex flex-col items-center justify-center text-on-surface-variant px-lg py-xs hover:text-primary active:scale-95 transition-all duration-150">
        <span className="material-symbols-outlined">settings</span>
        <span className="text-label-sm mt-1">Settings</span>
      </button>
    </nav>
  );
}
