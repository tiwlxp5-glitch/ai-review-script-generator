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
  BarChart2,
  Video,
  Lock,
  MessageSquare,
  Hash,
  MessageCircle,
  Clapperboard,
  Flame,
} from "lucide-react";
import UpgradeProModal from "@/components/UpgradeProModal";
import TeleprompterModal from "@/components/TeleprompterModal";

interface UsageData {
  user_type: "admin" | "pro" | "plus" | "free" | "guest";
  is_admin: boolean;
  limit: number;
  used: number;
  remaining: number | "unlimited";
}

interface ShotItem {
  time: string;
  visual: string;
  audio: string;
  text_on_screen: string;
}

const TONE_OPTIONS = [
  { id: "general", label: "💬 เป็นกันเอง", desc: "เพื่อนเล่าให้เพื่อนฟัง พูดเป็นธรรมชาติ" },
  { id: "drama", label: "💥 ดราม่า/ปัญหาแทงใจ", desc: "เปิดด้วยเรื่องราว/ชวนตกใจ หยุดคนดูใน 3 วินาที" },
  { id: "asmr", label: "📦 ASMR / Unboxing", desc: "เน้นโชว์เสียงแกะกล่องและความฟินของสินค้า" },
  { id: "expert", label: "🎓 ผู้เชี่ยวชาญ / รู้ลึก", desc: "น่าเชื่อถือ ให้ความรู้เชิงลึกก่อนปักตะกร้า" },
  { id: "funny", label: "🤣 สายฮา / มุกตลก", desc: "สนุกสนาน เป็นกันเอง ชวนหัวเราะและเอ็นดู" },
];

export default function DashboardPage() {
  const [productName, setProductName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [productLinkOrExtra, setProductLinkOrExtra] = useState("");
  const [toneStyle, setToneStyle] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [shotList, setShotList] = useState<ShotItem[]>([]);
  const [caption, setCaption] = useState<string>("");
  const [hashtags, setHashtags] = useState<string>("");
  const [pinnedComment, setPinnedComment] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"script" | "shotlist" | "caption">("script");

  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [modalDefaultPlan, setModalDefaultPlan] = useState<"plus" | "pro">("pro");
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);

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
    setCopiedCaption(false);

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
          tone_style: toneStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างสคริปต์");
      }

      setGeneratedScript(data.script || "");
      setShotList(data.shot_list || []);
      setCaption(data.caption || "");
      setHashtags(data.hashtags || "");
      setPinnedComment(data.pinned_comment || "");

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

  const handleCopyScript = async () => {
    if (!generatedScript) return;
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyCaptionBundle = async () => {
    const bundle = `${caption}\n\n${hashtags}\n\n💬 ปักตะกร้า: ${pinnedComment}`;
    try {
      await navigator.clipboard.writeText(bundle);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error("Failed to copy caption bundle:", err);
    }
  };

  const handleReset = () => {
    setProductName("");
    setTargetAudience("");
    setProductLinkOrExtra("");
    setGeneratedScript(null);
    setShotList([]);
    setCaption("");
    setHashtags("");
    setPinnedComment("");
    setError(null);
    setCopied(false);
  };

  const isProOrAdmin = usage?.user_type === "pro" || usage?.user_type === "admin";
  const isPlusUser = usage?.user_type === "plus" || isProOrAdmin;

  const openUpgradeModal = (plan: "plus" | "pro" = "pro") => {
    setModalDefaultPlan(plan);
    setIsProModalOpen(true);
  };

  const wordCount = generatedScript
    ? generatedScript.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const charCount = generatedScript ? generatedScript.length : 0;

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4 px-2 sm:px-4">
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
            รีวิวสินค้า TikTok Studio
          </span>
        </h1>

        {/* Sub-headline & Description */}
        <div className="space-y-1.5">
          <p className="text-lg sm:text-xl font-bold text-slate-100">
            สไตล์คนใช้จริง + ตารางถ่าย B-Roll + อ่านบท Teleprompter
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            สร้างสคริปต์สั้นกระชับ ปิดการขายง่าย พร้อมแคปชันและแฮชแท็กติดเทรนด์
          </p>
        </div>

        {/* Quota Usage Badge & Upgrade Action Buttons */}
        {usage && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {usage.user_type === "admin" ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>ผู้ดูแลระบบ (ใช้งานไม่จำกัด)</span>
              </span>
            ) : usage.user_type === "pro" ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-md shadow-amber-500/10">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>
                  สมาชิก Pro (200 สคริปต์):{" "}
                  <strong className="text-white">
                    เหลือ {usage.remaining} / {usage.limit} ครั้ง
                  </strong>
                </span>
              </span>
            ) : usage.user_type === "plus" ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>
                    สมาชิก Plus:{" "}
                    <strong className="text-white">
                      เหลือ {usage.remaining} / {usage.limit} ครั้ง
                    </strong>
                  </span>
                </span>
                <button
                  onClick={() => openUpgradeModal("pro")}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center space-x-1"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  <span>อัปเกรด Pro รับ Teleprompter & B-Roll (199.-)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  <span>
                    สิทธิ์ฟรีเดือนนี้:{" "}
                    <strong className="text-white">
                      เหลือ {usage.remaining} / {usage.limit} ครั้ง
                    </strong>
                  </span>
                </span>
                <button
                  onClick={() => openUpgradeModal("plus")}
                  className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
                >
                  <span>Plus (99.-)</span>
                </button>
                <button
                  onClick={() => openUpgradeModal("pro")}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center space-x-1"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Pro (199.-)</span>
                </button>
              </div>
            )}
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
            {error.includes("สิทธิ์การใช้งานในเดือนนี้ของคุณหมดแล้ว") && (
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  อัปเกรดบัญชีเพื่อเพิ่มสิทธิ์ใช้งาน 100-200 ครั้ง/เดือน!
                </span>
                <button
                  onClick={() => openUpgradeModal("pro")}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition flex items-center space-x-1"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>ดูรายละเอียดแพ็กเกจ</span>
                </button>
              </div>
            )}
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
          </div>

          {/* Field 2: Tone of Voice Selection (Multi-Style) */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-purple-300 flex items-center justify-between">
              <span>🎭 เลือกโทนการเล่าเรื่อง (Tone of Voice)</span>
              <span className="text-xs font-normal text-amber-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>5 โทนการเล่า</span>
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setToneStyle(tone.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    toneStyle === tone.id
                      ? "bg-purple-600/20 border-purple-500 text-purple-200 ring-2 ring-purple-500/30"
                      : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-200">{tone.label}</p>
                  <p className="text-[11px] text-slate-400 pt-0.5 truncate">{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Target Audience */}
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
          </div>

          {/* Field 4: Product Link or Extra Info */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-purple-300">
              🔗 ลิงก์สินค้า / รายละเอียดจุดเด่นเพิ่มเติม{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={productLinkOrExtra}
              onChange={(e) => setProductLinkOrExtra(e.target.value)}
              placeholder="แปะลิงก์สินค้า TikTok Shop/Shopee หรือใส่สเปกเด่นที่อยากเน้น"
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
                <span>กำลังออกแบบสคริปต์ + ตารางถ่าย B-Roll ด้วย AI...</span>
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
          {/* Header Bar with Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  สคริปต์รีวิว & ข้อมูลคอนเทนต์
                </h2>
                <p className="text-xs text-slate-400">
                  คัดลอกหรือเปิดอ่านบทผ่าน Teleprompter ได้ทันที
                </p>
              </div>
            </div>

            {generatedScript && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {/* Teleprompter Mode Button */}
                <button
                  onClick={() => {
                    if (isProOrAdmin) {
                      setIsTeleprompterOpen(true);
                    } else {
                      openUpgradeModal("pro");
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5 ${
                    isProOrAdmin
                      ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/20"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  <Video className="w-4 h-4 fill-current" />
                  <span>โหมดอ่านบท (Teleprompter)</span>
                  {!isProOrAdmin && <Lock className="w-3.5 h-3.5 text-amber-400 ml-1" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                  title="เริ่มใหม่"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs (Script / Visual Shot-list / Caption) */}
          {generatedScript && (
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab("script")}
                className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition ${
                  activeTab === "script"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>บทพูดพากย์เสียง</span>
              </button>

              <button
                onClick={() => setActiveTab("shotlist")}
                className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition ${
                  activeTab === "shotlist"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clapperboard className="w-4 h-4" />
                <span>ตารางถ่าย B-Roll</span>
                {!isProOrAdmin && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                    PRO
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("caption")}
                className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition ${
                  activeTab === "caption"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>แคปชัน & แฮชแท็ก</span>
                {!isProOrAdmin && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                    PRO
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  กำลังคิดสคริปต์และจัดตารางถ่ายทำคลิป...
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                  สไตล์ภาษาพูดธรรมชาติ เรียบง่าย ลื่นไหล ดึงดูดสายตาคนดู
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab 1: Voiceover Main Script */}
              {activeTab === "script" && (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-sans selection:bg-purple-500/30">
                    {generatedScript}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <div className="flex items-center space-x-4">
                      <span>
                        จำนวนคำ: <strong className="text-slate-200">{wordCount}</strong> คำ
                      </span>
                      <span>
                        ตัวอักษร: <strong className="text-slate-200">{charCount}</strong> ตัว
                      </span>
                    </div>
                    <button
                      onClick={handleCopyScript}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition ${
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
                </div>
              )}

              {/* Tab 2: Visual Shot-List Table (B-Roll) */}
              {activeTab === "shotlist" && (
                <div className="space-y-4">
                  {!isProOrAdmin && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>
                          อัปเกรดเป็น Pro เพื่อดูตารางกำกับภาพ Visual B-Roll ฉบับเต็ม!
                        </span>
                      </div>
                      <button
                        onClick={() => openUpgradeModal("pro")}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                      >
                        ปลดล็อก Pro (199.-)
                      </button>
                    </div>
                  )}

                  {shotList.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-900/90 text-purple-300 font-bold border-b border-slate-800">
                          <tr>
                            <th className="p-3 sm:p-4 w-20">เวลา</th>
                            <th className="p-3 sm:p-4">🎥 ภาพที่ต้องถ่าย (B-Roll)</th>
                            <th className="p-3 sm:p-4">🗣️ เสียงพูด</th>
                            <th className="p-3 sm:p-4">📝 ขึ้นซับกลางจอ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-200">
                          {shotList.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50 transition">
                              <td className="p-3 sm:p-4 font-mono text-amber-400 font-bold whitespace-nowrap">
                                {item.time}
                              </td>
                              <td className="p-3 sm:p-4 leading-relaxed">{item.visual}</td>
                              <td className="p-3 sm:p-4 leading-relaxed text-slate-300">
                                {item.audio}
                              </td>
                              <td className="p-3 sm:p-4 leading-relaxed text-emerald-300 font-semibold">
                                {item.text_on_screen}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <p className="text-sm">สคริปต์นี้ไม่มีตาราง Shot-List แยก หรือสคริปต์สั้นเกินไป</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: TikTok Caption & Hashtags */}
              {activeTab === "caption" && (
                <div className="space-y-4">
                  {!isProOrAdmin && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>อัปเกรดเป็น Pro เพื่อใช้แคปชันและแฮชแท็กดันฟีด!</span>
                      </div>
                      <button
                        onClick={() => openUpgradeModal("pro")}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                      >
                        ปลดล็อก Pro (199.-)
                      </button>
                    </div>
                  )}

                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-sm text-slate-200">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        📌 แคปชันสำหรับโพสต์คลิป (Caption)
                      </h4>
                      <p className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 leading-relaxed">
                        {caption || `รีวิว ${productName} คุ้มค่าตอบโจทย์ชัวร์!`}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                        🏷️ แฮชแท็กดันฟีดติดเทรนด์ (Hashtags)
                      </h4>
                      <p className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-purple-300 text-xs">
                        {hashtags || "#TikTokShop #รีวิวของดีบอกต่อ #รีวิวสินค้า"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                        💬 ข้อความพิมพ์ปักตะกร้าในคอมเมนต์ (Pinned Comment)
                      </h4>
                      <p className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-amber-200 text-xs">
                        {pinnedComment || "พิกัดกดที่ตะกร้าเหลืองซ้ายมือได้เลยครับ!"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleCopyCaptionBundle}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        copiedCaption
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-emerald-600 hover:bg-emerald-500 text-slate-950"
                      }`}
                    >
                      {copiedCaption ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>คัดลอกชุดแคปชันทั้งหมดแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>คัดลอกแคปชัน + แฮชแท็ก ทั้งหมด</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upgrade Plus/Pro Modal */}
      <UpgradeProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        defaultPlan={modalDefaultPlan}
      />

      {/* Teleprompter Modal */}
      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        scriptText={generatedScript || ""}
        productName={productName}
      />
    </div>
  );
}
