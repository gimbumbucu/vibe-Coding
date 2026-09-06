import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tauri: Next.js 앱을 정적 파일(out/)로 내보내기
  output: "export",
  // Tauri WebView2 환경에서는 next/image 서버 최적화 불가
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
