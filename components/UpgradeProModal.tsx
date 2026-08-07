"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  X,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Crown,
  MessageCircle,
  ShieldCheck,
  Video,
  Clapperboard,
  Hash,
  CreditCard,
  QrCode,
  Loader2,
  Flame,
} from "lucide-react";
import AIBrainComparisonModal from "@/components/AIBrainComparisonModal";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "plus" | "pro";
  currentPlan?: "free" | "plus" | "pro" | "admin" | "member" | "guest";
  customMessage?: string;
}

export default function UpgradeProModal({
  isOpen,
  onClose,
  defaultPlan = "pro",
  currentPlan = "free",
  customMessage,
}: UpgradeProModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"plus" | "pro">(defaultPlan);
  const [copiedLineId, setCopiedLineId] = useState(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [isBrainComparisonOpen, setIsBrainComparisonOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentPlan === "plus") {
        setSelectedPlan("pro");
      } else {
        setSelectedPlan(defaultPlan);
      }
    }
  }, [isOpen, defaultPlan, currentPlan]);

  if (!isOpen) return null;

  const isCurrentPlus = currentPlan === "plus";
  const isCurrentProOrAdmin = currentPlan === "pro" || currentPlan === "admin";

  const lineId = "tiwlip99";
  const lineUrl = `https://line.me/R/ti/p/~tiwlip99`;

  const handleCopyLineId = async () => {
    try {
      await navigator.clipboard.writeText(lineId);
      setCopiedLineId(true);
      setTimeout(() => setCopiedLineId(false), 2500);
    } catch (err) {
      console.error("Failed to copy LINE ID:", err);
    }
  };

  const handleStripeCheckout = async (plan: "plus" | "pro") => {
    setIsProcessingStripe(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างลิงก์ชำระเงิน");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      alert(err?.message || "ไม่สามารถเชื่อมต่อกับระบบชำระเงินได้");
      setIsProcessingStripe(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-purple-500/30 shadow-2xl bg-slate-950/95 space-y-4 sm:space-y-6 text-slate-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Custom High-Converting Quota Message Banner */}
        {customMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs sm:text-sm font-bold flex items-start space-x-3 shadow-lg shadow-amber-500/10 animate-in fade-in">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 fill-amber-400" />
            <span className="leading-relaxed">{customMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide shadow-md animate-pulse">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>โปรลดพิเศษ (เฉพาะช่วงนี้)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isCurrentPlus ? "อัปเกรดเป็น Pro Plan" : "เลือกแพ็กเกจที่เหมาะกับคุณ"}
          </h2>

          {/* Urgency Price Increase Notice */}
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center flex items-center justify-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span>⚠️ ราคาอาจจะปรับขึ้นเร็วๆ นี้ (รีบสมัครก่อนปรับเป็นราคาปกติ!)</span>
          </div>

          {/* Core Value Proposition Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 text-left space-y-1">
            <p className="text-xs sm:text-sm font-bold text-amber-300 flex items-center space-x-1.5">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>ถ้าคุณเป็นสายขายของแล้วไม่อยากเสียเวลาคิดสคริปต์ ซื้อเถอะครับคุ้มแน่นอน!</span>
            </p>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed pl-5">
              คิดสคริปต์คมๆ ➔ ดูตารางบอกมุมกล้อง B-Roll ➔ เปิดเครื่องอ่านบท Teleprompter ขณะถ่าย ➔ ก๊อปแคปชันปักตะกร้าโพสต์คลิปได้ทันที!
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid (Plus vs Pro) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Plus Plan Card */}
          <div
            onClick={() => {
              if (!isCurrentPlus) {
                setSelectedPlan("plus");
              }
            }}
            className={`relative rounded-2xl p-5 border transition-all space-y-4 flex flex-col justify-between ${
              isCurrentPlus
                ? "bg-slate-900/40 border-slate-800/80 cursor-not-allowed opacity-80"
                : selectedPlan === "plus"
                ? "bg-slate-900/95 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10 cursor-pointer"
                : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 opacity-90 hover:opacity-100 cursor-pointer"
            }`}
          >
            {/* Active Current Plan Badge */}
            {isCurrentPlus && (
              <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center space-x-1 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>แพ็กเกจปัจจุบันของคุณ</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Plus Plan (เก่งขึ้น 10 เท่า)</span>
                </span>
                {isCurrentPlus ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    ใช้งานอยู่
                  </span>
                ) : selectedPlan === "plus" ? (
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : null}
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-black text-white">99</span>
                  <span className="text-xs font-semibold text-slate-400">บาท / เดือน</span>
                  <span className="text-[10px] text-slate-500 line-through">ปกติ 149.-</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-0.5">เน้นสร้างสคริปต์อย่างเดียว 100 ครั้ง/เดือน</p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>สร้างสคริปต์บทพูด <strong>100 ครั้ง / เดือน</strong></span>
                </li>
                <li className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AI เก่งขึ้น <strong>10 เท่า (PAS Framework)</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBrainComparisonOpen(true);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold flex items-center space-x-1 shrink-0 transition cursor-pointer"
                  >
                    <span>เทียบสมอง AI</span>
                  </button>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ปลดล็อก Tone of Voice <strong>5 สไตล์</strong></span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="line-through">ตารางกำกับภาพ Visual B-Roll</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="line-through">เครื่องอ่านบท Teleprompter</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. Pro Plan Card (Recommended) */}
          <div
            onClick={() => setSelectedPlan("pro")}
            className={`relative rounded-2xl p-5 border transition-all cursor-pointer space-y-4 flex flex-col justify-between ${
              selectedPlan === "pro"
                ? "bg-slate-900/95 border-amber-500 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/15"
                : "bg-slate-900/60 border-slate-800/80 hover:border-amber-500/40 opacity-90 hover:opacity-100"
            }`}
          >
            {/* Top Ribbon Badge */}
            {isCurrentProOrAdmin ? (
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center space-x-1 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>แพ็กเกจปัจจุบันของคุณ</span>
              </div>
            ) : (
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                {isCurrentPlus ? "⚡ อัปเกรดบวกเพิ่ม 100.-" : "🔥 Pro Workflow ครบเซ็ต"}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Pro (เก่งขึ้น 20 เท่า Master Copywriter)</span>
                </span>
                {isCurrentProOrAdmin ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    ใช้งานอยู่
                  </span>
                ) : selectedPlan === "pro" ? (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : null}
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-black text-amber-400">199</span>
                  <span className="text-xs font-semibold text-slate-400">บาท / เดือน</span>
                  <span className="text-[10px] text-slate-500 line-through">ปกติ 299.-</span>
                </div>
                <p className="text-[11px] text-amber-300/90 font-medium pt-0.5">
                  {isCurrentPlus
                    ? "เพิ่มเงินเพียง 100 บาท รับเพิ่มเป็น 200 สคริปต์ + ฟีเจอร์ Workflow ครบเซ็ต!"
                    : "สคริปต์จุใจ 200 ครั้ง (ตกครั้งละ < 1 บาท) + ฟีเจอร์มืออาชีพจบในที่เดียว"}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>สร้างสคริปต์จุใจ <strong>200 ครั้ง / เดือน</strong></span>
                </li>
                <li className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>AI เก่งขึ้น <strong>20 เท่า + 3 Hook Options</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBrainComparisonOpen(true);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center space-x-1 shrink-0 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                    <span>ดูสเปกสมอง AI 🧠</span>
                  </button>
                </li>
                <li className="flex items-start space-x-2">
                  <Clapperboard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-amber-300">Director's Cut B-Roll Table</strong> (มุมกล้อง + แสง + SFX)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Video className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-amber-300">เครื่องอ่านบท Teleprompter</strong> (อ่านบทไป อัดคลิปไป อัดจบในเทคเดียว)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Hash className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-amber-300">ชุดแคปชัน + แฮชแท็ก + ปักตะกร้า</strong> (พร้อมคัดลอกลง TikTok/Reels)
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>ปลดล็อกครบ <strong>10 โทนการเล่าเรื่องระดับ Pro</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Automated Stripe Payment Action */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1.5">
            <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-300">
              <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>รองรับ <strong>PromptPay QR Code</strong> สแกนจ่ายใน 2 วินาที</span>
              <span className="text-slate-600">|</span>
              <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>บัตรเครดิต / เดบิต</span>
            </div>
            <p className="text-[11px] text-slate-400">
              ชำระเงินปลอดภัยสูงสุด 100% ผ่านระบบ Stripe Secure (บัญชีจะปรับเป็น{" "}
              <strong className="text-amber-300 font-bold">
                {selectedPlan === "pro" ? "Pro Plan (199.-)" : "Plus Plan (99.-)"}
              </strong>{" "}
              ให้อัตโนมัติทันทีหลังชำระเงิน)
            </p>
          </div>

          <button
            onClick={() => handleStripeCheckout(selectedPlan)}
            disabled={isProcessingStripe}
            className={`w-full py-4 px-6 rounded-2xl text-base font-bold transition duration-200 active:scale-[0.99] flex items-center justify-center space-x-2 shadow-xl cursor-pointer disabled:opacity-50 ${
              selectedPlan === "pro"
                ? "text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-amber-500/30"
                : "text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30"
            }`}
          >
            {isProcessingStripe ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังเชื่อมต่อหน้าชำระเงินปลอดภัย...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 fill-current" />
                <span>
                  {isCurrentPlus && selectedPlan === "pro"
                    ? "ชำระเงินอัปเกรดเป็น Pro (199.-/เดือน)"
                    : `ชำระเงินอัปเกรด ${selectedPlan === "pro" ? "Pro Plan (199.-/เดือน)" : "Plus Plan (99.-/เดือน)"}`}
                </span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Brain Comparison Overlay Sub-Modal */}
      <AIBrainComparisonModal
        isOpen={isBrainComparisonOpen}
        onClose={() => setIsBrainComparisonOpen(false)}
        onUpgradeClick={(plan) => {
          setSelectedPlan(plan);
          setIsBrainComparisonOpen(false);
        }}
      />
    </div>
  );
}
