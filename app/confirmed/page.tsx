"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function ConfirmedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-3.5 sm:px-4 py-4 sm:py-8">
      <div className="w-full max-w-md text-center">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 xs:p-7 sm:p-10 border border-purple-500/30 shadow-2xl bg-slate-950/90 space-y-5 sm:space-y-6 relative overflow-hidden">
          {/* Ambient Glow background */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Success Animated Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-purple-600 to-indigo-600 shadow-xl shadow-emerald-500/20 flex items-center justify-center text-white ring-4 ring-emerald-500/20 animate-pulse">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-purple-600 text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ยืนยันอีเมลสำเร็จเรียบร้อย!</span>
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              ยินดีต้อนรับเข้าสู่ระบบ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              บัญชีของคุณยืนยันตัวตนสำเร็จแล้ว พร้อมเริ่มสร้างสคริปต์รีวิวสินค้า TikTok และ Reels ได้ทันที
            </p>
          </div>

          {/* Countdown & CTA */}
          <div className="pt-2 sm:pt-4 space-y-4">
            <Link
              href="/dashboard"
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl text-xs sm:text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition group min-h-[48px]"
            >
              <Zap className="w-5 h-5 text-white fill-white shrink-0" />
              <span>เริ่มสร้างสคริปต์ทันที</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>

            <p className="text-xs text-slate-400">
              กำลังนำท่านไปยังหน้าสร้างสคริปต์อัตโนมัติภายใน{" "}
              <strong className="text-purple-300 font-bold">{countdown}</strong> วินาที...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
