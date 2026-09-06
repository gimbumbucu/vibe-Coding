"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { mockStories } from "@/lib/data";

export default function Stories() {
  return (
    <section className="w-full bg-white dark:bg-black py-4 border-b md:border md:rounded-xl border-neutral-200 dark:border-neutral-800 mb-4 overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto px-4 scrollbar-none no-scrollbar">
        {mockStories.map((story) => (
          <button
            key={story.id}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
          >
            <div className="relative">
              {/* Story Ring */}
              <div
                className={`w-[66px] h-[66px] rounded-full flex items-center justify-center p-[2px] transition-transform group-hover:scale-105 ${
                  story.hasUnseenStory
                    ? "bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              >
                {/* Inner White/Dark Border Spacer */}
                <div className="w-full h-full rounded-full bg-white dark:bg-black p-[2px] relative overflow-hidden">
                  <Image
                    src={story.avatar}
                    alt={story.username}
                    fill
                    sizes="60px"
                    className="rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Add Story (+) Badge for My Story */}
              {story.id === "s0" && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-white">
                  <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
              )}
            </div>

            {/* Username Label */}
            <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate max-w-[70px]">
              {story.username}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
