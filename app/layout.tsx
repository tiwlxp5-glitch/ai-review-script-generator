import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Review Script Generator - สคริปต์รีวิวสินค้าด้วย AI",
  description: "เครื่องมือช่วยสร้างสคริปต์รีวิวสินค้าแบบมืออาชีพ เจาะกลุ่มเป้าหมาย เพิ่มยอดขายด้วย AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-purple-500/30 selection:text-purple-200`}
      >
        {/* Background glow effects */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none z-0 overflow-hidden opacity-30 blur-3xl">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-600/40 rounded-full animate-pulse" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-600/40 rounded-full animate-pulse delay-1000" />
        </div>

        <Navbar />
        
        <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>

        <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} AI Review Script Generator. All rights reserved.</p>
            <p className="text-slate-400">สร้างสรรค์โดย ทิวลิปเองจร้าาา</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
