"use client";

import { X, Zap, Crown, Check, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface AIBrainComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeClick: (plan: "plus" | "pro") => void;
  currentPlan?: "free" | "plus" | "pro" | "admin" | "member" | "guest";
}

export default function AIBrainComparisonModal({
  isOpen,
  onClose,
  onUpgradeClick,
  currentPlan = "free",
}: AIBrainComparisonModalProps) {
  if (!isOpen) return null;

  const isCurrentPlus = currentPlan === "plus";
  const isCurrentProOrAdmin = currentPlan === "pro" || currentPlan === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-card rounded-2xl sm:rounded-3xl p-4.5 xs:p-6 sm:p-8 border border-amber-500/30 shadow-2xl bg-slate-950/95 space-y-5 sm:space-y-6 text-slate-100 my-auto max-h-[90dvh] overflow-y-auto">
        {/* Ambient Background Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-11 h-11 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition z-10 cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>เจาะลึกความลับสมอง AI</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            ทำไมสคริปต์สายฟรี ถึงไม่ปังเท่าแพ็กเกจ Pro? 🧠
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            เบื้องหลังอัลกอริทึมสร้างสคริปต์ที่ถูกออกแบบใหม่ทั้งหมด เพื่อเปลี่ยนยอดวิวเป็นยอดขายด้วยจิตวิทยาขั้นสูง
          </p>
        </div>

        {/* 3 Tier Brain Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
          {/* 1. Free Tier Brain */}
          <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold inline-block">
                สายฟรี (Free Plan)
              </div>
              <h3 className="text-sm font-bold text-white">สมอง AI ระดับเบสิก</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                สร้างสคริปต์ภาษาพูดเรียบง่าย ทั่วๆ ไป ไม่เน้นจิตวิทยาการขาย เหมาะสำหรับทดลองระบบ
              </p>
              <ul className="space-y-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>2 โทนเสียงพื้นฐาน</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>ภาษาพูดเป็นกันเอง</span>
                </li>
                <li className="flex items-start space-x-1.5 text-slate-500">
                  <X className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                  <span>ไม่มีตัวเลือก Hook 3 แบบ</span>
                </li>
                <li className="flex items-start space-x-1.5 text-slate-500">
                  <X className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                  <span>ไม่มีการทลายข้อโต้แย้งในใจคนดู</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. Plus Tier Brain */}
          <div className="rounded-2xl p-4 bg-indigo-950/40 border border-indigo-500/30 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold inline-flex items-center space-x-1.5 flex-wrap gap-1">
                <span>Plus (99.-/เดือน)</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40 line-through font-extrabold text-[10px]">
                  ปกติ 149.-
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Experienced Copywriter</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                เก่งขึ้น 10 เท่า! ใช้โครงสร้าง PAS (ชี้ปัญหา ➔ จี้แผล ➔ เฉลยด้วยสินค้า) ขายของเนียนๆ
              </p>
              <ul className="space-y-2 text-[11px] text-slate-200 pt-2 border-t border-indigo-500/20">
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>5 โทนเสียงระดับมือโปร</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>โครงสร้างบทพูด PAS Framework</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>ตาราง B-Roll 4-6 ฉาก</span>
                </li>
              </ul>
            </div>
            {isCurrentPlus ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold text-center flex items-center justify-center space-x-1.5 shadow-sm min-h-[44px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>กำลังใช้งานอยู่ (Plus Plan)</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onUpgradeClick("plus");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer min-h-[44px]"
              >
                <span>ลอง Plus Plan (99.-)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 3. Pro Tier Brain (Master Copywriter) */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-amber-500/15 via-purple-500/15 to-slate-900 border-2 border-amber-500/60 space-y-3 flex flex-col justify-between ring-2 ring-amber-500/20 shadow-xl shadow-amber-500/10">
            <div className="space-y-2">
              <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black inline-flex items-center space-x-1.5 flex-wrap gap-1 shadow-sm">
                <span>Pro Master (199.-/เดือน)</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-950/80 text-rose-300 border border-rose-500/50 line-through font-extrabold text-[10px]">
                  ปกติ 299.-
                </span>
              </div>
              <h3 className="text-sm font-black text-amber-300">Master Copywriter ค่าตัวหลักแสน</h3>
              <p className="text-[11px] text-amber-100/90 leading-relaxed font-medium">
                เก่งขึ้น 20 เท่า! เรียนรู้แม่แบบสคริปต์ไวรัลล้านวิว (Few-Shot Virality) + ทลายความลังเลซื้อ
              </p>
              <ul className="space-y-2 text-[11px] text-slate-100 pt-2 border-t border-amber-500/30">
                <li className="flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                  <span><strong>3 Hook Options:</strong> ทางเลือกคำเปิด 0-3 วินาทีแรก</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Objection Handling:</strong> ดักทางความกลัวในใจคนดู</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Director's B-Roll Table:</strong> มุมกล้อง + แสง + SFX เสียง</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Teleprompter Mode:</strong> เปิดอ่านบทไป ถ่ายคลิปไป</span>
                </li>
              </ul>
            </div>
            {isCurrentProOrAdmin ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold text-center flex items-center justify-center space-x-1.5 shadow-sm min-h-[44px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>กำลังใช้งานอยู่ (Pro Plan)</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onUpgradeClick("pro");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-1 shadow-lg shadow-amber-500/20 cursor-pointer min-h-[44px]"
              >
                <Crown className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                <span>ปลดล็อกสมอง Pro Master (199.-)</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Core Concept Explanation */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
          <p className="font-bold text-amber-300 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span>ทำไม Pro Plan ถึงคุ้มค่าที่สุดสำหรับการสร้างยอดขาย?</span>
          </p>
          <p className="text-slate-400 leading-relaxed">
            คลิปไวรัลส่วนใหญ่ตกคนดูได้ที่ <strong>0-3 วินาทีแรก (Hook)</strong> และปิดการขายด้วยการ <strong>ขจัดความลังเลในใจ (Objection Handling)</strong> เช่น กลัวแพง กลัวไม่ตรงปก Pro Plan ถูกฝึกมาเพื่อเติมเต็มส่วนนี้โดยเฉพาะ ช่วยให้คลิปรีวิวของคุณหยุดฟีดและทำเงินได้จริง!
          </p>
        </div>
      </div>
    </div>
  );
}
