"use client";

import Image from "next/image";
import Link from "next/link";
import { currentUser, mockSuggestions } from "@/lib/data";

export default function Suggestions() {
  return (
    <aside className="hidden lg:block w-80 pt-6 px-4 text-black dark:text-white">
      {/* Current User Profile Box */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden relative border border-neutral-200 dark:border-neutral-800">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm hover:underline cursor-pointer">
              {currentUser.username}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {currentUser.name}
            </span>
          </div>
        </div>

        <button className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">
          전환
        </button>
      </div>

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          회원님을 위한 추천
        </span>
        <button className="text-xs font-semibold text-black dark:text-white hover:opacity-60 transition-opacity">
          모두 보기
        </button>
      </div>

      {/* Suggested Users List */}
      <div className="space-y-3 mb-6">
        {mockSuggestions.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative border border-neutral-100 dark:border-neutral-900">
                <Image
                  src={item.avatar}
                  alt={item.username}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col text-xs leading-snug max-w-[140px]">
                <span className="font-semibold hover:underline cursor-pointer truncate">
                  {item.username}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 truncate">
                  {item.subtitle}
                </span>
              </div>
            </div>

            <button className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">
              팔로우
            </button>
          </div>
        ))}
      </div>

      {/* Footer Info Links */}
      <footer className="text-[11px] text-neutral-400 dark:text-neutral-600 leading-relaxed space-y-3">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link href="#" className="hover:underline">소개</Link> •
          <Link href="#" className="hover:underline">도움말</Link> •
          <Link href="#" className="hover:underline">홍보 센터</Link> •
          <Link href="#" className="hover:underline">API</Link> •
          <Link href="#" className="hover:underline">채용 정보</Link> •
          <Link href="#" className="hover:underline">개인정보처리방침</Link> •
          <Link href="#" className="hover:underline">약관</Link> •
          <Link href="#" className="hover:underline">위치</Link> •
          <Link href="#" className="hover:underline">언어</Link>
        </div>

        <p className="uppercase text-[10px] tracking-wider">
          © 2026 OUTSTARGRAM FROM META
        </p>
      </footer>
    </aside>
  );
}
