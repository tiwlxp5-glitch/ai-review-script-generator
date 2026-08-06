"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Crown,
  BarChart2,
  FileText,
  AlertCircle,
  Video,
  Clapperboard,
  Hash,
  Loader2,
  Lock,
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

interface ToneOption {
  id: string;
  label: string;
  desc: string;
  detail: string;
  minPlan: "free" | "plus" | "pro";
}

const TONE_OPTIONS: ToneOption[] = [
  // 2 Free Tones
  {
    id: "general",
    label: "💬 เป็นกันเอง",
    desc: "เพื่อนเล่าให้เพื่อนฟัง พูดเป็นธรรมชาติ",
    detail: "ภาษาพูดเรียบง่าย ชวนคุยเหมือนนั่งเล่าให้เพื่อนสนิทฟัง ไม่ประดิดประดอย",
    minPlan: "free",
  },
  {
    id: "drama",
    label: "💥 ดราม่า / ปัญหาแทงใจ",
    desc: "ชวนตกใจ หยุดคนดูใน 3 วินาทีแรก",
    detail: "เปิดเรื่องด้วยความขัดแย้ง ปัญหาใหญ่แทงใจดำ หรือคำถามชวนสะดุ้งเพื่อดึงดูดสายตา",
    minPlan: "free",
  },
  // 3 Plus Tones (Total 5 for Plus)
  {
    id: "asmr",
    label: "📦 ASMR / Unboxing ฟินๆ",
    desc: "เน้นโชว์เสียงสัมผัส และความน่าใช้",
    detail: "เน้นการแกะกล่อง โชว์เนื้อสัมผัส เสียงสัมผัส และอารมณ์ฟินตอนได้ลองใช้สินค้า",
    minPlan: "plus",
  },
  {
    id: "expert",
    label: "🎓 ผู้เชี่ยวชาญ / รู้ลึก",
    desc: "น่าเชื่อถือ ให้ความรู้ก่อนปักตะกร้า",
    detail: "สวมบทผู้เชี่ยวชาญ อธิบายกลไกการทำงานหรือเหตุผลเชิงลึก ให้คนดูเชื่อถือแล้วตบท้ายด้วยสินค้า",
    minPlan: "plus",
  },
  {
    id: "funny",
    label: "🤣 สายฮา / มุกตลก",
    desc: "ตลก สนุกสนาน ปล่อยมุกเป็นกันเอง",
    detail: "เน้นความตลกขบขัน มุกเสี่ยวล้อเลียนตัวเอง ให้คนดูอารมณ์ดีเพลิดเพลินโดยไม่รู้สึกโดนยัดเยียดขาย",
    minPlan: "plus",
  },
  // 5 Pro Tones (Total 10 for Pro)
  {
    id: "hardsale",
    label: "⚡ Hard Sale / นาทีทอง",
    desc: "กระตุ้นยอดด่วน แจกโปรลดแหลก",
    detail: "การขายแบบเปิดเผยดุดัน เน้นแจกโค้ดโปรโมชันพิเศษ จำนวนจำกัด กระตุ้นให้รีบกดตะกร้าทันที",
    minPlan: "pro",
  },
  {
    id: "softsale",
    label: "🌟 ป้ายยาแบบแอบเนียน",
    desc: "โชว์ไลฟ์สไตล์ สอดแทรกสินค้าเนียนๆ",
    detail: "ถ่ายทอดวิถีชีวิตประจำวัน แล้วสอดแทรกสินค้าเข้ามาในบทพูดแบบเป็นธรรมชาติเหมือนไม่ได้ขาย",
    minPlan: "pro",
  },
  {
    id: "warning",
    label: "🛑 เตือนภัย / อย่าหาทำ",
    desc: "เปิดด้วยคำเตือน ชี้ข้อผิดพลาด",
    detail: "เปิดหัวเรื่องเตือนภัย เช่น 'หยุดทำสิ่งนี้ถ้าไม่อยาก...' เพื่อกระตุกคนดู แล้วชี้ทางแก้ด้วยสินค้า",
    minPlan: "pro",
  },
  {
    id: "beforeafter",
    label: "🧪 เปรียบเทียบก่อน-หลัง",
    desc: "ชี้ความต่าง ก่อนใช้ vs หลังใช้ชัดเจน",
    detail: "เปรียบเทียบผลลัพธ์ระหว่างก่อนใช้และหลังใช้สินค้าแบบตรงไปตรงมา สร้างความฮือฮาอยากทดลอง",
    minPlan: "pro",
  },
  {
    id: "emotional",
    label: "❤️ ซาบซึ้ง / ประทับใจ",
    desc: "เล่าความรู้สึกอบอุ่น เปลี่ยนแปลงชีวิต",
    detail: "เล่าเรื่องราวความรู้สึกประทับใจ การเปลี่ยนแปลงของชีวิต หรือความอบอุ่นหลังได้ใช้สินค้า",
    minPlan: "pro",
  },
];

export default function DashboardPage() {
  const [productName, setProductName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [productLinkOrExtra, setProductLinkOrExtra] = useState("");
  const [toneStyle, setToneStyle] = useState("general");
  const [scriptLength, setScriptLength] = useState<"short" | "medium" | "long">("medium");
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

  const isProOrAdmin = usage?.user_type === "pro" || usage?.user_type === "admin";
  const isPlusUser = usage?.user_type === "plus" || isProOrAdmin;

  const openUpgradeModal = (plan: "plus" | "pro" = "pro") => {
    setModalDefaultPlan(plan);
    setIsProModalOpen(true);
  };

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
          script_length: scriptLength,
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
    if (!isProOrAdmin) {
      openUpgradeModal("pro");
      return;
    }
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

  const wordCount = generatedScript
    ? generatedScript.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const charCount = generatedScript ? generatedScript.length : 0;

  return (
    <div className="space-y-6 sm:space-y-10 max-w-4xl mx-auto py-2 sm:py-4 px-3 sm:px-4">
      {/* Hero Header Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        {/* Top Icon Badge */}
        <div className="inline-flex items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-xl shadow-purple-500/25 ring-1 ring-purple-400/30">
          <Pencil className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white/20" />
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-snug sm:leading-tight">
          AI คิดสคริปต์{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
            รีวิวสินค้า TikTok Studio
          </span>
        </h1>

        {/* Sub-headline & Description */}
        <div className="space-y-1">
          <p className="text-sm sm:text-xl font-bold text-slate-100 leading-snug">
            สไตล์คนใช้จริง + ตารางมุมกล้อง B-Roll + อ่านบท Teleprompter ขณะถ่าย
          </p>
          <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto leading-normal">
            Workflow การถ่ายคลิปแบบมืออาชีพจบในที่เดียว พร้อมแคปชันและแฮชแท็กติดเทรนด์
          </p>
        </div>

        {/* Quota Usage Badge & Upgrade Action Buttons */}
        {usage && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {usage.user_type === "admin" ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-sky-400 to-purple-500 text-slate-950 text-xs font-black shadow-lg shadow-purple-500/25 border border-white/40">
                <Crown className="w-4 h-4 text-slate-950 fill-slate-950" />
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
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center space-x-1 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  <span>อัปเกรด Pro Workflow (199.-)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  <span>
                    สิทธิ์ฟรีสัปดาห์นี้:{" "}
                    <strong className="text-white">
                      เหลือ {usage.remaining} / {usage.limit} ครั้ง
                    </strong>
                  </span>
                </span>
                <button
                  onClick={() => openUpgradeModal("plus")}
                  className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition cursor-pointer"
                >
                  <span>Plus (99.-)</span>
                </button>
                <button
                  onClick={() => openUpgradeModal("pro")}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center space-x-1 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Pro Workflow (199.-)</span>
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
            {(error.includes("สิทธิ์การใช้งาน") || error.includes("หมดแล้ว")) && (
              <div className="pt-3 border-t border-rose-500/20 space-y-2">
                <p className="text-xs font-bold text-amber-300">
                  💡 ถ้าคุณเป็นสายขายของแล้วไม่อยากเสียเวลาคิดสคริปต์ ซื้อเถอะครับคุ้มแน่นอน!
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-300">
                    อัปเกรดบัญชีรับสิทธิ์ใช้งานสูงสุด 200 ครั้ง/เดือน + AI เก่งขึ้น 20 เท่า!
                  </span>
                  <button
                    onClick={() => openUpgradeModal("pro")}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition flex items-center space-x-1 cursor-pointer shrink-0 ml-2"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>ดูแพ็กเกจสุดคุ้ม</span>
                  </button>
                </div>
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

          {/* Field 1.5: Script Length Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-purple-300">
              ⏱️ เลือกความยาวสคริปต์ (Script Length)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScriptLength("short")}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  scriptLength === "short"
                    ? "bg-purple-600/25 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-purple-500/40"
                }`}
              >
                <div className="text-xs sm:text-sm font-bold text-slate-100">⚡ สั้น</div>
                <div className="text-[11px] text-slate-400 mt-0.5">~15-30 วินาที</div>
                <div className="text-[10px] text-purple-300/80 mt-1 hidden sm:block">กระชับ ปิดขายด่วน</div>
              </button>

              <button
                type="button"
                onClick={() => setScriptLength("medium")}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  scriptLength === "medium"
                    ? "bg-purple-600/25 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-purple-500/40"
                }`}
              >
                <div className="text-xs sm:text-sm font-bold text-slate-100">🎬 ปกติ</div>
                <div className="text-[11px] text-slate-400 mt-0.5">~30-60 วินาที</div>
                <div className="text-[10px] text-purple-300/80 mt-1 hidden sm:block">เล่าเรื่องสมดุล</div>
              </button>

              <button
                type="button"
                onClick={() => setScriptLength("long")}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  scriptLength === "long"
                    ? "bg-purple-600/25 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-purple-500/40"
                }`}
              >
                <div className="text-xs sm:text-sm font-bold text-slate-100">📖 ยาว</div>
                <div className="text-[11px] text-slate-400 mt-0.5">~60-90+ วินาที</div>
                <div className="text-[10px] text-purple-300/80 mt-1 hidden sm:block">เจาะลึก+สาธิต</div>
              </button>
            </div>
          </div>

          {/* Field 2: Tone of Voice Selection (Multi-Tiered 10 Tones) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-sm font-semibold text-purple-300">
                🎭 เลือกโทนการเล่าเรื่อง (Tone of Voice)
              </label>
              <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isProOrAdmin
                    ? "ปลดล็อกครบ 10 โทนระดับ Pro"
                    : isPlusUser
                    ? "ปลดล็อกแล้ว 5 โทน (อัปเกรด Pro รับ 10 โทน)"
                    : "ฟรี 2 โทน (อัปเกรดเพื่อรับครบ 10 โทน)"}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TONE_OPTIONS.map((tone) => {
                const isAllowed =
                  tone.minPlan === "free" ||
                  (tone.minPlan === "plus" && isPlusUser) ||
                  (tone.minPlan === "pro" && isProOrAdmin);

                const isSelected = toneStyle === tone.id && isAllowed;

                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => {
                      if (tone.minPlan === "plus" && !isPlusUser) {
                        openUpgradeModal("plus");
                        return;
                      }
                      if (tone.minPlan === "pro" && !isProOrAdmin) {
                        openUpgradeModal("pro");
                        return;
                      }
                      setToneStyle(tone.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? "bg-purple-600/25 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10"
                        : isAllowed
                        ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:bg-slate-900"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-75 hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>{tone.label}</span>
                      </p>

                      {!isAllowed && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center space-x-1 shrink-0 ${
                            tone.minPlan === "pro"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                          }`}
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>{tone.minPlan.toUpperCase()}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-purple-300/90 pt-1">
                      {tone.desc}
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1 leading-normal border-t border-slate-800/50 mt-2">
                      💡 <span className="italic">{tone.detail}</span>
                    </p>
                  </button>
                );
              })}
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
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-800/80 shadow-2xl bg-slate-950/90 space-y-5 sm:space-y-6">
          {/* Header Bar with Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-800/80 gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  สคริปต์รีวิว & ข้อมูลคอนเทนต์
                </h2>
                <p className="text-xs text-slate-400">
                  คัดลอกหรือทดลองอ่านบทผ่าน Teleprompter ได้ทันที
                </p>
              </div>
            </div>

            {generatedScript && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Teleprompter Mode Button */}
                <button
                  onClick={() => setIsTeleprompterOpen(true)}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold shadow transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isProOrAdmin
                      ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/20"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                  }`}
                >
                  <Video className="w-4 h-4 fill-current shrink-0" />
                  <span>
                    {isProOrAdmin
                      ? "โหมดอ่านบท (Teleprompter)"
                      : "ทดลองโหมดอ่านบท"}
                  </span>
                  {!isProOrAdmin && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                      PRO
                    </span>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer shrink-0"
                  title="เริ่มใหม่"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs (Script / Visual Shot-list / Caption) */}
          {generatedScript && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 border-b border-slate-800/80 pb-2 text-xs font-bold overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                onClick={() => setActiveTab("script")}
                className={`px-3 sm:px-4 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                  activeTab === "script"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>บทพูดพากย์เสียง</span>
              </button>

              <button
                onClick={() => setActiveTab("shotlist")}
                className={`px-3 sm:px-4 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                  activeTab === "shotlist"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>ตารางถ่าย B-Roll</span>
                {!isProOrAdmin && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                    PRO
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("caption")}
                className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
                  activeTab === "caption"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Hash className="w-4 h-4 text-amber-400" />
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
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition cursor-pointer ${
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
                  {!isProOrAdmin ? (
                    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950/90 p-1">
                      {/* Lock Banner Overlay */}
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-lg shadow-amber-500/10">
                          <Lock className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="space-y-1 max-w-md">
                          <h3 className="text-base font-bold text-white">
                            ตารางถ่าย B-Roll ถูกล็อกสำหรับผู้ใช้ Pro
                          </h3>
                          <p className="text-xs text-amber-300 font-semibold">
                            💡 ถ้าคุณเป็นสายขายของแล้วไม่อยากเสียเวลาคิดสคริปต์ ซื้อเถอะครับคุ้มแน่นอน!
                          </p>
                          <p className="text-xs text-slate-300">
                            ตาราง Shot-by-Shot แยกมุมกล้อง คำพูด และซับกลางจอของสินค้าคุณถูกล็อกไว้ ปลดล็อกเพื่อดูรายละเอียดฉบับเต็ม!
                          </p>
                        </div>
                        <button
                          onClick={() => openUpgradeModal("pro")}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-xl shadow-amber-500/25 transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Crown className="w-4 h-4 fill-slate-950" />
                          <span>ปลดล็อกตาราง B-Roll ของคุณ (199.-)</span>
                        </button>
                      </div>

                      {/* Dummy Teaser Mock Table (Heavily Blurred & Masked) */}
                      <div className="overflow-x-auto filter blur-md select-none pointer-events-none opacity-20 p-2">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-slate-900 text-purple-300 font-bold border-b border-slate-800">
                            <tr>
                              <th className="p-3">เวลา</th>
                              <th className="p-3">🎥 ภาพที่ต้องถ่าย (B-Roll)</th>
                              <th className="p-3">🗣️ เสียงพูด</th>
                              <th className="p-3">📝 ขึ้นซับกลางจอ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 bg-slate-950 text-slate-200">
                            <tr>
                              <td className="p-3 font-mono text-amber-400 font-bold">0-3s</td>
                              <td className="p-3">ภาพซูมหน้าผู้พูดทำหน้าตกใจ แล้วตัดภาพไปที่ปัญหา...</td>
                              <td className="p-3">"อย่าเพิ่งทิ้งสิ่งนี้! ถ้ายังไม่ได้ลองตัวช่วยนี้..."</td>
                              <td className="p-3 text-emerald-300 font-semibold">หยุดดูคลิปนี้ก่อน 😱</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono text-amber-400 font-bold">3-7s</td>
                              <td className="p-3">หยิบสินค้าขึ้นมาสาธิตการใช้งานจริง โชว์ผลลัพธ์...</td>
                              <td className="p-3">"ลองใช้ตัวนี้ แค่ 5 วินาที รู้เรื่องเลยทันที"</td>
                              <td className="p-3 text-emerald-300 font-semibold">เห็นผลใน 5 วินาที ✨</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono text-amber-400 font-bold">7-15s</td>
                              <td className="p-3">ชูสินค้าคู่กับหน้ายิ้มมั่นใจ เอานิ้วชี้ไปที่ตะกร้า...</td>
                              <td className="p-3">"พิกัดกดที่ตะกร้าเหลืองซ้ายมือได้เลยครับ"</td>
                              <td className="p-3 text-emerald-300 font-semibold">กดตะกร้าเหลืองซ้ายล่าง 🛒</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Actual Pro / Admin Shot-list Table */
                    shotList.length > 0 ? (
                      <div>
                        {/* Mobile View: Stacked Cards for Phone Screens */}
                        <div className="space-y-3 sm:hidden max-h-80 overflow-y-auto pr-1">
                          {shotList.map((item, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                <span className="font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]">
                                  ⏱️ {item.time}
                                </span>
                                <span className="text-emerald-300 font-bold text-[11px] truncate max-w-[180px]">
                                  📝 {item.text_on_screen}
                                </span>
                              </div>
                              <div className="space-y-1.5 text-slate-200">
                                <p className="leading-relaxed">
                                  <strong className="text-purple-300 font-semibold">🎥 ภาพ B-Roll:</strong> {item.visual}
                                </p>
                                <p className="leading-relaxed text-slate-300">
                                  <strong className="text-indigo-300 font-semibold">🗣️ เสียงพูด:</strong> {item.audio}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop & Tablet View: Wide Scrollable Table */}
                        <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-800 max-h-96 overflow-y-auto">
                          <table className="w-full min-w-[600px] text-left text-xs sm:text-sm">
                            <thead className="bg-slate-900/90 text-purple-300 font-bold border-b border-slate-800 sticky top-0">
                              <tr>
                                <th className="p-3 sm:p-4 w-20 whitespace-nowrap">เวลา</th>
                                <th className="p-3 sm:p-4 w-2/5 min-w-[180px]">🎥 ภาพที่ต้องถ่าย (B-Roll)</th>
                                <th className="p-3 sm:p-4 w-2/5 min-w-[200px]">🗣️ เสียงพูด</th>
                                <th className="p-3 sm:p-4 w-1/5 min-w-[140px]">📝 ขึ้นซับกลางจอ</th>
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
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-sm">สคริปต์นี้ไม่มีตาราง Shot-List แยก หรือสคริปต์สั้นเกินไป</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Tab 3: TikTok Caption & Hashtags */}
              {activeTab === "caption" && (
                <div className="space-y-4">
                  {!isProOrAdmin ? (
                    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950/90 p-6 space-y-4">
                      {/* Lock Banner Overlay */}
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-lg shadow-amber-500/10">
                          <Lock className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="space-y-1 max-w-md">
                          <h3 className="text-base font-bold text-white">
                            ชุดแคปชันและแฮชแท็กถูกล็อกสำหรับผู้ใช้ Pro
                          </h3>
                          <p className="text-xs text-amber-300 font-semibold">
                            💡 ถ้าคุณเป็นสายขายของแล้วไม่อยากเสียเวลาคิดสคริปต์ ซื้อเถอะครับคุ้มแน่นอน!
                          </p>
                          <p className="text-xs text-slate-300">
                            แคปชันเรียกลูกค้า แฮชแท็กดันฟีด และข้อความปักตะกร้าของสินค้าคุณถูกล็อกไว้ ปลดล็อกเพื่อใช้งานจริง!
                          </p>
                        </div>
                        <button
                          onClick={() => openUpgradeModal("pro")}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-xl shadow-amber-500/25 transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Crown className="w-4 h-4 fill-slate-950" />
                          <span>ปลดล็อกแคปชัน & แฮชแท็กของคุณ (199.-)</span>
                        </button>
                      </div>

                      {/* Dummy Teaser Mock Captions (Heavily Blurred & Masked) */}
                      <div className="filter blur-md select-none pointer-events-none opacity-20 space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                            📌 แคปชันสำหรับโพสต์คลิป (Caption)
                          </h4>
                          <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                            ต้องยกให้เป็นสินค้าอันดับหนึ่งในใจตอนนี้เลยแก! ทาแล้วสบายผิวมาก ไม่เหนอะ ไม่วอก ซึมไว กดที่ตะกร้าซ้ายล่างได้เลยน้า ✨
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                            🏷️ แฮชแท็กดันฟีดติดเทรนด์ (Hashtags)
                          </h4>
                          <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                            #รีวิวสินค้า #TikTokShopป้ายยา #ของดีบอกต่อ #ใช้ดีบอกต่อ #ไอเทมเด็ด
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                            💬 ข้อความพิมพ์ปักตะกร้าในคอมเมนต์ (Pinned Comment)
                          </h4>
                          <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                            พิกัดตะกร้าเหลืองมุมซ้ายล่างเลยน้าแก ช่วงนี้มีโปรลดราคาอยู่ รีบกดก่อนหมดนะ! 💛👇
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Actual Pro / Admin Captions Display */
                    <div className="space-y-4">
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
                          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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
        </div>
      )}

      {/* Upgrade Plus/Pro Modal */}
      <UpgradeProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        defaultPlan={modalDefaultPlan}
        currentPlan={usage?.user_type}
      />

      {/* Teleprompter Modal */}
      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        scriptText={generatedScript || ""}
        productName={productName}
        isDemo={!isProOrAdmin}
        onUpgradeClick={() => openUpgradeModal("pro")}
      />
    </div>
  );
}
