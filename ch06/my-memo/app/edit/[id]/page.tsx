"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { format } from "date-fns";

export default function EditMemoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const memos = useStore((state) => state.memos);
  const updateMemo = useStore((state) => state.updateMemo);
  const deleteMemo = useStore((state) => state.deleteMemo);
  
  const memo = memos.find(m => m.id === id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setContent(memo.content);
    } else {
      router.push("/");
    }
  }, [memo, router]);

  if (!memo) return null;

  const handleSave = () => {
    setIsSaving(true);
    updateMemo(id, { title, content });
    setTimeout(() => {
      setIsSaving(false);
      router.push("/");
    }, 400);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this memo? This action cannot be undone.")) {
      deleteMemo(id);
      router.push("/");
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 bg-surface z-40 border-b border-outline-variant">
        <div className="flex items-center justify-between px-md py-sm max-w-[1200px] mx-auto">
          <div className="flex items-center gap-md">
            <button
              onClick={() => router.back()}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer p-sm hover:bg-surface-container rounded-full transition-colors active:opacity-80"
            >
              arrow_back
            </button>
            <h1 className="text-headline-md font-bold text-primary">Edit Memo</h1>
          </div>
          
          <div className="flex items-center gap-sm">
            <button className="material-symbols-outlined text-on-surface-variant cursor-pointer p-sm hover:bg-surface-container rounded-full transition-colors active:opacity-80">
              share
            </button>
            <button
              onClick={handleDelete}
              className="material-symbols-outlined text-error cursor-pointer p-sm hover:bg-error-container/20 rounded-full transition-colors active:opacity-80"
              aria-label="Delete memo"
            >
              delete
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-on-primary px-lg py-sm rounded-full text-label-md shadow-sm hover:brightness-110 transition-all active:scale-95 flex items-center gap-xs"
            >
              {isSaving ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "20px" }}>progress_activity</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>check</span>
              )}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-md md:px-xl py-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          
          {/* Left Column: Editor */}
          <div className="lg:col-span-8 flex flex-col gap-lg">
            <div className="flex items-center gap-sm">
              <span className="bg-primary-container text-on-primary-container px-sm py-xs rounded-full text-label-sm flex items-center gap-xs">
                <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>edit</span>
                Edit Mode
              </span>
              <span className="text-on-surface-variant text-label-sm">
                Last edited {format(new Date(memo.updatedAt), 'MMM d, h:mm a')}
              </span>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-lg md:p-xl border border-outline-variant shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-headline-lg-mobile md:text-headline-lg text-on-surface mb-md p-0 placeholder:text-on-surface-variant/50 active-cursor"
                placeholder="Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <div className="flex flex-wrap gap-sm mb-lg">
                {memo.tags.map(tag => (
                  <span key={tag} className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full text-label-sm flex items-center gap-xs cursor-pointer hover:brightness-95">
                    #{tag.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                ))}
                <button className="text-primary hover:bg-primary-container/10 px-sm py-xs rounded-full text-label-sm flex items-center gap-xs transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                  Add Tag
                </button>
              </div>

              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-body-md text-on-surface-variant min-h-[400px] p-0 resize-none active-cursor leading-relaxed"
                placeholder="Start typing your memo..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Context & Metadata */}
          <div className="lg:col-span-4 flex flex-col gap-lg sticky top-24">
            <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant">
              <h3 className="text-headline-md text-on-surface mb-md">Memo Details</h3>
              <div className="space-y-md">
                <div className="flex items-center justify-between py-xs border-b border-outline-variant/30">
                  <span className="text-label-md text-on-surface-variant">Created</span>
                  <span className="text-body-md text-on-surface">{format(new Date(memo.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between py-xs border-b border-outline-variant/30">
                  <span className="text-label-md text-on-surface-variant">Word Count</span>
                  <span className="text-body-md text-on-surface">{content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>

            {/* Collaborative Toggle */}
            <div className="flex items-center justify-between p-md bg-primary-container/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">sync</span>
                <span className="text-label-md text-on-surface">Auto-Sync Enabled</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </main>

      {/* Formatting Bar Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest/90 backdrop-blur-md px-lg py-sm rounded-full shadow-xl border border-outline-variant flex items-center gap-md z-50">
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">format_bold</button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">format_italic</button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">format_list_bulleted</button>
        <div className="w-[1px] h-6 bg-outline-variant"></div>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">add_photo_alternate</button>
      </div>
    </div>
  );
}
