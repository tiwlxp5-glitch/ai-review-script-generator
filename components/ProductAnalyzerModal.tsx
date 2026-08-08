"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Search,
  Check,
  Target,
  Crown,
  Zap,
  ArrowRight,
  Loader2,
  Lightbulb,
  ShieldCheck,
  Flame,
  HelpCircle,
  Clock,
} from "lucide-react";

interface AnalysisResult {
  refined_product_name: string;
  target_audience: string;
  key_usps: string[];
  viral_hooks?: string[];
  objection_tips?: string;
  market_insight?: string;
}

interface ProductAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAnalysis: (data: {
    productName: string;
    targetAudience: string;
    extraInfo: string;
  }) => void;
  userPlan?: "free" | "plus" | "pro" | "admin" | "guest";
  onUpgradeClick?: (plan: "plus" | "pro") => void;
}

export default function ProductAnalyzerModal({
  isOpen,
  onClose,
  onApplyAnalysis,
  userPlan = "free",
  onUpgradeClick,
}: ProductAnalyzerModalProps) {
  const [productInput, setProductInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [applied, setApplied] = useState(false);

  // Live Adaptive Countdown States
  const [countdown, setCountdown] = useState(4);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState("🔍 AI กำลังสืบค้นข้อมูลและสเปกเด่นของสินค้า...");

  if (!isOpen) return null;

  const isProOrAdmin = userPlan === "pro" || userPlan === "admin";
  const isPlusUser = userPlan === "plus" || isProOrAdmin;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInput.trim()) {
      setError("กรุณากรอกชื่อหรือคำอธิบายสินค้าที่ต้องการวิเคราะห์");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setApplied(false);
    setCountdown(4);
    setLoadingProgress(5);
    setStepMessage("🔍 AI กำลังสืบค้นข้อมูลและสเปกเด่นของสินค้า...");

    const totalEstimateSec = 4;
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      let remainingSec = Math.ceil(totalEstimateSec - elapsedSec);
      if (remainingSec <= 0) remainingSec = 1;
      setCountdown(remainingSec);

      let newProgress = 5;
      if (elapsedSec <= 3.0) {
        newProgress = Math.round(5 + (elapsedSec / 3.0) * 80);
      } else {
        newProgress = Math.min(96, Math.round(85 + (elapsedSec - 3.0) * 4));
      }
      setLoadingProgress(newProgress);

      if (elapsedSec < 1.2) {
        setStepMessage("🔍 AI กำลังสืบค้นข้อมูลและสเปกเด่นของสินค้า...");
      } else if (elapsedSec < 2.8) {
        setStepMessage("🎯 กำลังวิเคราะห์พฤติกรรมกลุ่มเป้าหมาย...");
      } else {
        setStepMessage("✨ กำลังจัดทำแนวทางจุดขาย และชื่อสินค้าดึงดูดใจ...");
      }
    }, 100);

    try {
      const res = await fetch("/api/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_input: productInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์สินค้า");
      }

      setLoadingProgress(100);
      setCountdown(0);
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err?.message || "ไม่สามารถเชื่อมต่อระบบวิเคราะห์ได้");
    } finally {
      clearInterval(timerInterval);
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!analysis) return;
    const extraInfoText = [
      analysis.key_usps && analysis.key_usps.length > 0
        ? `จุดขายเด่น: ${analysis.key_usps.join(", ")}`
        : "",
      analysis.objection_tips ? `การทลายข้อโต้แย้ง: ${analysis.objection_tips}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    onApplyAnalysis({
      productName: analysis.refined_product_name || productInput,
      targetAudience: analysis.target_audience || "",
      extraInfo: extraInfoText,
    });

    setApplied(true);
    setTimeout(() => {
      onClose();
      setApplied(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-2xl sm:rounded-3xl p-4.5 xs:p-6 sm:p-7 border border-purple-500/30 shadow-2xl bg-slate-950/95 space-y-4 sm:space-y-5 text-slate-100 my-auto max-h-[90dvh] overflow-y-auto">
        {/* Glows */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-11 h-11 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition z-10 cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
            <span>ผู้ช่วย AI วิเคราะห์สินค้า & แนะนำกลุ่มเป้าหมาย</span>
          </div>
          <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-white leading-snug">
            ไม่รู้จะกรอกรายละเอียดอะไร? ให้ AI ช่วยคิดให้อัตโนมัติ! ✨
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            พิมพ์แค่คำกว้างๆ เช่น "ครีมกันแดด", "แก้วเก็บความเย็น" หรือ "รองเท้าวิ่ง" แล้วให้ AI ถอดรหัสกลุ่มเป้าหมายทันที
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleAnalyze} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              required
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              placeholder='เช่น "ครีมกันแดด", "หูฟังไร้สาย"'
              className="w-full pl-4 pr-28 py-3.5 text-xs sm:text-sm rounded-2xl min-h-[48px] text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-md min-h-[38px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>วิเคราะห์</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Adaptive Countdown & Progress Card */}
        {loading && (
          <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/40 bg-slate-900/90 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {stepMessage}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center space-x-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>อีกประมาณ {countdown} วินาที</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>กำลังประมวลผลข้อมูลสินค้า...</span>
                <span>{loadingProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Tiered AI Intelligence Upsell Banner */}
        {!isProOrAdmin && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-3 text-xs">
            <div className="space-y-0.5 min-w-0">
              <p className="font-bold text-amber-300 flex items-center space-x-1.5">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <span>ยกระดับการวิเคราะห์เชิงลึก 360° ด้วย Pro Plan!</span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isPlusUser
                  ? "อัปเกรด Pro รับเพิ่ม: วิเคราะห์ Pain Points + 3 ไอเดีย Hook ไวรัล + ทลายข้อโต้แย้งคู่แข่ง"
                  : "สายฟรีได้รับการวิเคราะห์พื้นฐาน อัปเกรด Pro รับการวิเคราะห์การตลาด 360° สมบูรณ์แบบ"}
              </p>
            </div>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpgradeClick("pro");
                }}
                className="w-full xs:w-auto px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md transition text-center min-h-[44px] flex items-center justify-center"
              >
                อัปเกรด Pro ⚡
              </button>
            )}
          </div>
        )}

        {/* Analysis Output Section */}
        {analysis && (
          <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in">
            {/* Refined Name & Target Audience */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center space-x-1">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                  <span>ชื่อสินค้าที่ปรับให้คมชัดขึ้น (Refined Name)</span>
                </span>
                <p className="text-sm font-bold text-amber-300">
                  {analysis.refined_product_name}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <span>กลุ่มเป้าหมายที่แท้จริง (Target Audience Insights)</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {analysis.target_audience}
                </p>
              </div>

              {analysis.key_usps && analysis.key_usps.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                    จุดขายเด่นพิเศษที่ควรเน้น (Key USPs):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.key_usps.map((usp, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-semibold"
                      >
                        ✓ {usp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Feature Highlights (Viral Hooks & Objections) */}
              {isProOrAdmin && analysis.viral_hooks && analysis.viral_hooks.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>ไอเดีย Hook ไวรัลประจำสินค้านี้ (Pro Exclusive):</span>
                  </span>
                  <ul className="space-y-1 text-xs text-amber-200/90 italic">
                    {analysis.viral_hooks.map((hook, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span>🔥</span>
                        <span>"{hook}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApply}
              className={`w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 shadow-xl cursor-pointer min-h-[48px] ${
                applied
                  ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                  : "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-500/30"
              }`}
            >
              {applied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 stroke-[3] shrink-0" />
                  <span>นำข้อมูลเข้าใส่ฟอร์มหลักเรียบร้อยแล้ว!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white shrink-0" />
                  <span>✨ นำข้อมูลผลวิเคราะห์นี้ไปใส่ในฟอร์มสร้างสคริปต์ทันที</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
