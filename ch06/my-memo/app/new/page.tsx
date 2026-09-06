"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function NewMemoPage() {
  const router = useRouter();
  const addMemo = useStore((state) => state.addMemo);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }

    setIsSaving(true);
    // Simulate slight delay for saving animation
    setTimeout(() => {
      addMemo({
        title,
        content,
        tags: [],
      });
      router.push("/");
    }, 400);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md overflow-x-hidden">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 bg-surface z-30 border-b border-outline-variant">
        <div className="flex items-center justify-between px-md py-sm max-w-[1200px] mx-auto h-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-xs px-md py-sm rounded-full text-on-surface-variant hover:bg-surface-container transition-colors active:opacity-80 font-label-md"
          >
            <span className="material-symbols-outlined">close</span>
            <span className="hidden sm:inline">Cancel</span>
          </button>
          
          <h1 className="text-headline-md font-bold text-primary absolute left-1/2 -translate-x-1/2">
            New Memo
          </h1>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-lg py-sm rounded-full font-label-md font-bold transition-all cursor-pointer ${
              isSaving
                ? "bg-secondary-container text-on-secondary-container opacity-80"
                : "bg-primary text-on-primary hover:shadow-md active:scale-95"
            }`}
          >
            {isSaving ? "Saving..." : "Save & Close"}
          </button>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-md pt-lg pb-xl flex flex-col min-h-[calc(100vh-64px)]">
        {/* Metadata Chips */}
        <div className="flex items-center gap-sm mb-lg overflow-x-auto no-scrollbar">
          <button className="flex items-center gap-xs bg-surface-container-high px-md py-xs rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[18px]">label</span>
            <span className="text-label-sm">Add Tags</span>
          </button>
          <button className="flex items-center gap-xs bg-surface-container-high px-md py-xs rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[18px]">folder_open</span>
            <span className="text-label-sm">General</span>
          </button>
          <div className="h-6 w-[1px] bg-outline-variant mx-xs"></div>
          <span className="text-label-sm text-outline whitespace-nowrap">
            Unsaved draft
          </span>
        </div>

        {/* Title Input */}
        <div className="mb-md">
          <input
            autoFocus
            className="w-full bg-transparent border-none p-0 text-headline-lg placeholder:text-outline-variant text-on-surface focus:ring-0"
            placeholder="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content Textarea */}
        <div className="flex-grow flex flex-col">
          <textarea
            className="w-full flex-grow bg-transparent border-none p-0 text-body-lg placeholder:text-outline-variant text-on-surface-variant focus:ring-0 resize-none leading-relaxed"
            placeholder="Start typing your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        {/* Formatting Toolbar */}
        <div className="sticky bottom-md mt-lg flex items-center justify-between p-sm bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant">
          <div className="flex items-center gap-xs">
            <button className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Bold">
              <span className="material-symbols-outlined">format_bold</span>
            </button>
            <button className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Italic">
              <span className="material-symbols-outlined">format_italic</span>
            </button>
            <button className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="List">
              <span className="material-symbols-outlined">format_list_bulleted</span>
            </button>
            <button className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Checklist">
              <span className="material-symbols-outlined">checklist</span>
            </button>
          </div>
          <div className="flex items-center gap-xs">
            <button className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Add Image">
              <span className="material-symbols-outlined">image</span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-xs"></div>
            <button className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="More Options">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
      </main>

      {/* Ambient background detail */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none -z-10"></div>
    </div>
  );
}
