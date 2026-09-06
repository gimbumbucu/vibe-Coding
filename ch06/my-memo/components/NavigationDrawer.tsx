"use client";

import Link from "next/link";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  return (
    <>
      {/* Scrim Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-container-lowest shadow-xl rounded-r-xl transform transition-transform duration-300 flex flex-col h-full overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-lg flex flex-col items-start gap-md">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-container bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">person</span>
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-2 border-surface-container-lowest rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-headline-md font-bold text-primary">Your Notebook</h2>
            <span className="text-body-md text-on-surface-variant">Personal Space</span>
          </div>
        </div>

        <nav className="flex-grow flex flex-col py-sm overflow-y-auto no-scrollbar">
          <Link
            href="/"
            onClick={onClose}
            className="bg-primary-container text-on-primary-container rounded-full mx-sm my-xs px-md py-sm font-bold flex items-center gap-md active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              description
            </span>
            <span className="text-body-md">All Notes</span>
          </Link>
          <button className="text-on-surface-variant mx-sm my-xs px-md py-sm flex items-center gap-md hover:bg-surface-container-high active:scale-[0.98] transition-all rounded-full">
            <span className="material-symbols-outlined">folder</span>
            <span className="text-body-md">Folders</span>
          </button>
          <button className="text-on-surface-variant mx-sm my-xs px-md py-sm flex items-center gap-md hover:bg-surface-container-high active:scale-[0.98] transition-all rounded-full">
            <span className="material-symbols-outlined">archive</span>
            <span className="text-body-md">Archived</span>
          </button>
          <button className="text-on-surface-variant mx-sm my-xs px-md py-sm flex items-center gap-md hover:bg-surface-container-high active:scale-[0.98] transition-all rounded-full">
            <span className="material-symbols-outlined">delete</span>
            <span className="text-body-md">Trash</span>
          </button>

          <div className="mx-md my-md border-t border-outline-variant"></div>

          <div className="px-lg pb-xs">
            <span className="text-label-sm text-outline uppercase tracking-wider">Labels</span>
          </div>
          <button className="text-on-surface-variant mx-sm my-xs px-md py-sm flex items-center gap-md hover:bg-surface-container-high rounded-full transition-all">
            <span className="material-symbols-outlined text-sm">label</span>
            <span className="text-body-md">Work</span>
          </button>
          <button className="text-on-surface-variant mx-sm my-xs px-md py-sm flex items-center gap-md hover:bg-surface-container-high rounded-full transition-all">
            <span className="material-symbols-outlined text-sm">label</span>
            <span className="text-body-md">Ideas</span>
          </button>
        </nav>

        <div className="p-md border-t border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-label-sm text-on-surface-variant">Syncing...</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
