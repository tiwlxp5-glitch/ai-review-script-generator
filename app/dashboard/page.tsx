"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Zap,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  FileText,
  Crown,
  UserPlus,
  BarChart2,
  Link as LinkIcon,
  Target,
  ShoppingBag,
} from "lucide-react";

interface UsageData {
  user_type: "admin" | "member" | "guest";
  is_admin: boolean;
  limit: number;
  used: number;
  remaining: number | "unlimited";
}

export default function DashboardPage() {
  const [productName, setProductName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [productLinkOrExtra, setProductLinkOrExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/user-usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setError("กรุณากรอกชื่อสินค้าที่ต้องการรีวิว");
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: productName,
          target_audience: targetAudience,
          product_link_or_extra: productLinkOrExtra,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างสคริปต์");
      }

      setGeneratedScript(data.script || data.script_content || data.result);
      if (data.usage) {
        setUsage(data.usage);
      } else {
        fetchUsage();
      }
    } catch (err: any) {
      console.error("Script generation error:", err);
      setError(err?.message || "ไม่สามารถเชื่อมต่อกับระบบ AI ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedScript) return;
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReset = () => {
    setProductName("");
    setTargetAudience("");
    setProductLinkOrExtra("");
    setGeneratedScript(null);
    setError(null);
    setCopied(false);
  };

  const wordCount = generatedScript
    ? generatedScript.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const charCount = generatedScript ? generatedScript.length : 0;

  return (
    <div className="space-y-10 max-w-3xl mx-auto py-4 px-2 sm:px-4">
      {/* Hero Header Section */}
      <div className="text-center space-y-4">
        {/* Top Icon Badge */}
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-xl shadow-purple-500/25 ring-1 ring-purple-400/30">
          <Pencil className="w-7 h-7 text-white fill-white/20" />
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          AI คิดสคริปต์{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
            รีวิวสินค้า TikTok
          </span>
        </h1>

        {/* Sub-headline & Description */}
        <div className="space-y-1.5">
          <p className="text-lg sm:text-xl font-bold text-slate-100">
            สไตล์คนใช้จริง เล่าให้เพื่อนฟัง
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            ไม่เน้นยัดเยียดขายของ พูดเป็นธรรมชาติ พูดตามคลิปได้ทันที
          </p>
        </div>

        {/* Quota Usage Badge Indicator */}
        {usage && (
          <div className="inline-block pt-1">
            {usage.user_type === "admin" ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>บัญชีผู้ดูแลระบบ (ใช้งานได้ไม่จำกัด)</span>
              </span>
            ) : usage.user_type === "member" ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                <span>
                  สิทธิ์การใช้งานเดือนนี้:{" "}
                  <strong className="text-white font-bold">
                    เหลือ {usage.remaining} / 3 ครั้ง
                  </strong>
                </span>
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Input Form Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl bg-slate-950/80 backdrop-blur-xl space-y-6">
        {error && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Field 1: Product Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-purple-300">
              🛒 ชื่อสินค้าที่ต้องการรีวิว{" "}
              <span className="text-purple-400 font-normal">* จำเป็น</span>
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder='เช่น "ครีมกันแดด Dr.Pong สูตรไฮยา คุมมัน กันน้ำ"'
              className="w-full px-4 py-3.5 text-sm sm:text-base rounded-2xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {/* New Guideline for Product Name */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs space-y-1">
              <p className="text-slate-400 font-medium">
                <span className="text-rose-400 font-semibold">❌ ไม่ดี:</span> ครีมหน้าใส
              </p>
              <p className="text-slate-300 font-medium">
                <span className="text-emerald-400 font-semibold">✅ ที่ดี:</span> ครีมกันแดด Dr.Pong สูตรไฮยา คุมมัน กันน้ำ
              </p>
            </div>
          </div>

          {/* Field 2: Target Audience */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-purple-300">
              🎯 กลุ่มเป้าหมายผู้รับชม{" "}
              <span className="text-[#c084fc] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder='เช่น "พนักงานออฟฟิศที่ต้องออกแดดบ่อย หรือคนผิวแพ้ง่ายชอบทำกิจกรรมกลางแจ้ง"'
              className="w-full px-4 py-3.5 text-sm sm:text-base rounded-2xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {/* New Guideline for Target Audience */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs space-y-1">
              <p className="text-slate-400 font-medium">
                <span className="text-rose-400 font-semibold">❌ ไม่ดี:</span> คนทั่วไป
              </p>
              <p className="text-slate-300 font-medium">
                <span className="text-emerald-400 font-semibold">✅ ที่ดี:</span> พนักงานออฟฟิศที่ต้องออกแดดบ่อย หรือคนผิวแพ้ง่ายชอบทำกิจกรรมกลางแจ้ง
              </p>
            </div>
          </div>

          {/* Field 3: Product Link or Extra Info for AI (NEW - NO GUIDELINE) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-purple-300">
              🔗 ลิงก์สินค้า / รายละเอียดเพิ่มเติมส่งให้ AI{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={productLinkOrExtra}
              onChange={(e) => setProductLinkOrExtra(e.target.value)}
              placeholder="แปะลิงก์สินค้า TikTok Shop/Shopee หรือใส่จุดเด่นที่อยากเน้นให้ AI เพิ่มเติม"
              className="w-full px-4 py-3.5 text-sm sm:text-base rounded-2xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-xl shadow-purple-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>กำลังคิดสคริปต์ให้คุณด้วย AI...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-white fill-white" />
                <span>สร้างสคริปต์รีวิวสินค้า</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Display Card */}
      {(loading || generatedScript) && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl bg-slate-950/90 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  สคริปต์รีวิวที่ AI สร้างให้
                </h2>
                <p className="text-xs text-slate-400">
                  คัดลอกไปใช้อ่านพูดตามคลิปได้ทันที
                </p>
              </div>
            </div>

            {generatedScript && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                  title="เริ่มใหม่"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>คัดลอกสคริปต์</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  กำลังคิดสคริปต์รีวิว...
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                  แต่งสไตล์เป็นกันเอง พูดเรียบง่าย ลื่นไหล ดึงดูดสายตาคนดู
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-sans selection:bg-purple-500/30">
                {generatedScript}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <div className="flex items-center space-x-4">
                  <span>
                    จำนวนคำ:{" "}
                    <strong className="text-slate-200 font-semibold">
                      {wordCount}
                    </strong>{" "}
                    คำ
                  </span>
                  <span>
                    ตัวอักษร:{" "}
                    <strong className="text-slate-200 font-semibold">
                      {charCount}
                    </strong>{" "}
                    ตัว
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
                >
                  <span>{copied ? "คัดลอกแล้ว" : "คัดลอกสคริปต์"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
