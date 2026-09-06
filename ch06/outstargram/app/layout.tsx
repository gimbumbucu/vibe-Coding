import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outstargram",
  description: "Outstargram — 사진과 순간을 공유하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Mobile Navigation */}
          <MobileNav />

          {/* Main Content Area - offset for sidebar on desktop, header/footer on mobile */}
          <div className="md:pl-[72px] xl:pl-64 pt-14 md:pt-0 pb-16 md:pb-0 min-h-screen flex flex-col items-center">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
