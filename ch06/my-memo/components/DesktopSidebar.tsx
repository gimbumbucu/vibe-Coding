"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] w-72 bg-surface-container-lowest border-r border-outline-variant sticky top-16 self-start p-sm">
      <div className="flex flex-col gap-xs py-md">
        <Link
          href="/"
          className={`flex items-center gap-md rounded-full px-md py-sm transition-all active:scale-[0.98] ${
            pathname === "/"
              ? "bg-primary-container text-on-primary-container font-bold"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined" style={pathname === "/" ? { fontVariationSettings: "'FILL' 1" } : {}}>
            description
          </span>
          <span className="text-body-md">All Notes</span>
        </Link>
        <button className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high rounded-full px-md py-sm transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined">folder</span>
          <span className="text-body-md">Folders</span>
        </button>
        <button className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high rounded-full px-md py-sm transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined">archive</span>
          <span className="text-body-md">Archived</span>
        </button>
        <button className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high rounded-full px-md py-sm transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined">delete</span>
          <span className="text-body-md">Trash</span>
        </button>
      </div>

      <div className="mt-auto border-t border-outline-variant pt-md">
        <div className="px-md py-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            cloud_done
          </span>
          <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Synced</span>
        </div>
      </div>
    </aside>
  );
}
