"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration이 완료된 후에만 렌더링하여 서버/클라이언트 불일치를 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 자리 표시자 — 실제 버튼과 동일한 크기로 레이아웃 이동(CLS) 방지
    return <span className="w-6 h-6 block" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="w-6 h-6 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
    >
      {isDark ? (
        <Sun className="w-5 h-5 stroke-[1.75px]" />
      ) : (
        <Moon className="w-5 h-5 stroke-[1.75px]" />
      )}
    </button>
  );
}
