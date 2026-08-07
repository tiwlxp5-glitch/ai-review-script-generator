import type { Metadata } from "next";
import { Prompt, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ReviewScript AI - เครื่องมือคิดสคริปต์รีวิวสินค้าขายดีด้วย AI",
  description: "แพลตฟอร์มช่วยคิดสคริปต์วิดีโอรีวิวสินค้า ตารางกำกับภาพ B-Roll และเครื่องอ่านบท Teleprompter ดันยอดขายโฆษณา TikTok, Reels & Shorts",
  keywords: ["AI คิดสคริปต์", "สคริปต์รีวิวสินค้า", "TikTok Shop", "B-Roll Shot List", "Teleprompter", "ReviewScript AI"],
  authors: [{ name: "ทิวลิปเองจร้าาา" }],
  openGraph: {
    title: "ReviewScript AI - เครื่องมือคิดสคริปต์รีวิวสินค้าขายดีด้วย AI",
    description: "สร้างสคริปต์วิดีโอรีวิวระดับ Master Copywriter พร้อมตารางกำกับภาพ B-Roll เฟรมต่อเฟรม และโหมดอ่านบท Teleprompter",
    type: "website",
    locale: "th_TH",
    siteName: "ReviewScript AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewScript AI - เครื่องมือคิดสคริปต์รีวิวสินค้าขายดีด้วย AI",
    description: "สร้างสคริปต์วิดีโอรีวิวระดับ Master Copywriter พร้อมตารางกำกับภาพ B-Roll เฟรมต่อเฟรม",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`dark ${promptFont.variable} ${outfitFont.variable}`}>
      <body
        className={`${promptFont.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-purple-500/30 selection:text-purple-200 font-sans`}
      >
        {/* Ambient Premium Glow Mesh Background (Optimized for GPU & Mobile) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 sm:opacity-40">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-purple-900/30 via-indigo-900/30 to-slate-950 rounded-full blur-[60px] sm:blur-[120px]" />
          <div className="absolute top-1/4 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/15 rounded-full blur-[60px] sm:blur-[100px] animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-[60px] sm:blur-[100px] animate-pulse delay-1000" />
        </div>

        <Navbar />
        
        <main className="flex-1 relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          {children}
        </main>

        <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-3 text-center text-[11px] text-slate-500">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
            <p>© {new Date().getFullYear()} AI Review Script Generator. All rights reserved.</p>
            <p className="text-slate-400">สร้างสรรค์โดย ทิวลิปเองจร้าาา</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
