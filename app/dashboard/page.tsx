"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Pin,
  MessageSquare,
  Clock,
  Mic,
  History,
} from "lucide-react";
import UpgradeProModal from "@/components/UpgradeProModal";
import TeleprompterModal from "@/components/TeleprompterModal";
import AIBrainComparisonModal from "@/components/AIBrainComparisonModal";
import ProductAnalyzerModal from "@/components/ProductAnalyzerModal";
import AuthModal from "@/components/AuthModal";

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
  const [editedScript, setEditedScript] = useState<string>("");
  const [scriptMode, setScriptMode] = useState<"original" | "custom">("original");
  const [shotList, setShotList] = useState<ShotItem[]>([]);
  const [hooksList, setHooksList] = useState<any[]>([]);
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [hashtags, setHashtags] = useState<string>("");
  const [pinnedComment, setPinnedComment] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"script" | "shotlist" | "caption">("script");

  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [modalDefaultPlan, setModalDefaultPlan] = useState<"plus" | "pro">("pro");
  const [modalCustomMessage, setModalCustomMessage] = useState<string | undefined>();
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isBrainModalOpen, setIsBrainModalOpen] = useState(false);
  const [isAnalyzerModalOpen, setIsAnalyzerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Live Countdown & Progress States
  const [countdown, setCountdown] = useState(5);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState("🧠 AI กำลังวิเคราะห์สินค้าและกลุ่มเป้าหมาย...");

  const [successBanner, setSuccessBanner] = useState<{ plan: "plus" | "pro"; message: string } | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch(`/api/user-usage?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    }
  };

  useEffect(() => {
    const checkPaymentAndUsage = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const isSuccess = params.get("payment") === "success";
        const sessionId = params.get("session_id");
        const plan = params.get("plan");

        if (isSuccess) {
          if (sessionId) {
            try {
              const vRes = await fetch(`/api/verify-payment?session_id=${sessionId}&plan=${plan || ""}`);
              const vData = await vRes.json();
              if (vRes.ok && vData.success) {
                const finalPlan = vData.plan === "pro" ? "pro" : "plus";
                setSuccessBanner({
                  plan: finalPlan,
                  message: `การชำระเงินสำเร็จ! บัญชีของคุณถูกอัปเกรดเป็น ${
                    finalPlan === "pro" ? "Pro Plan (20 เท่า)" : "Plus Plan (10 เท่า)"
                  } เรียบร้อยแล้ว`,
                });
                window.dispatchEvent(new Event("profileUpdated"));
              } else {
                console.error("Payment verification failed:", vData);
                setError(
                  vData.error || "เกิดข้อผิดพลาดในการยืนยันการอัปเกรดสิทธิ์ กรุณาติดต่อผู้ดูแลระบบ"
                );
              }
            } catch (vErr) {
              console.error("Payment verification error:", vErr);
              setError("เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อยืนยันการชำระเงิน");
            }
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      await fetchUsage();
    };

    checkPaymentAndUsage();

    const handleProfileUpdateEvent = () => {
      fetchUsage();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("profileUpdated", handleProfileUpdateEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("profileUpdated", handleProfileUpdateEvent);
      }
    };
  }, []);


  const isProOrAdmin = usage?.user_type === "pro" || usage?.user_type === "admin";
  const isPlusUser = usage?.user_type === "plus" || isProOrAdmin;

  const getDisplayHooks = () => {
    if (hooksList && hooksList.length > 0) return hooksList;
    if (!generatedScript) return [];

    const hookA = generatedScript.match(/Hook\s*A[^:\n]*:\s*([^\n]+)/i) || generatedScript.match(/ตัวเลือก\s*A[^:\n]*:\s*([^\n]+)/i);
    const hookB = generatedScript.match(/Hook\s*B[^:\n]*:\s*([^\n]+)/i) || generatedScript.match(/ตัวเลือก\s*B[^:\n]*:\s*([^\n]+)/i);
    const hookC = generatedScript.match(/Hook\s*C[^:\n]*:\s*([^\n]+)/i) || generatedScript.match(/ตัวเลือก\s*C[^:\n]*:\s*([^\n]+)/i);

    if (hookA || hookB || hookC) {
      return [
        {
          id: "A",
          type: "Visual & Action Hook",
          badge: "👁️ Hook A: สายเน้นภาพ & Action",
          concept: "โชว์ช็อตสินค้า/การกระทำตื่นเต้น 3 วินาทีแรก เพื่อหยุดนิ้วคนดูบนฟีด",
          text: hookA ? hookA[1].trim() : "",
        },
        {
          id: "B",
          type: "Verbal Pain-Point Hook",
          badge: "🗣️ Hook B: สายเน้นสะกิดแผลจี้ปัญหา",
          concept: "ตั้งคำถามแทงใจดำ ชี้จุดเจ็บเรื่องปัญหาที่กลุ่มเป้าหมายกำลังเจออยู่",
          text: hookB ? hookB[1].trim() : "",
        },
        {
          id: "C",
          type: "Shocking & Contrast Hook",
          badge: "⚡ Hook C: สายเน้นช็อก & ทลายความเชื่อ",
          concept: "เปิดด้วยเรื่องน่าทึ่ง หรือข้อผิดพลาดที่คน 90% เข้าใจผิดชวนเอ๊ะอึ้ง",
          text: hookC ? hookC[1].trim() : "",
        },
      ].filter((h) => Boolean(h.text));
    }

    return [];
  };

  const openUpgradeModal = (plan: "plus" | "pro" = "pro", msg?: string) => {
    setModalDefaultPlan(plan);
    setModalCustomMessage(msg);
    setIsProModalOpen(true);
  };

  const triggerScriptGeneration = async (formData: {
    product_name: string;
    target_audience: string;
    product_link_or_extra: string;
    tone_style: string;
    script_length: "short" | "medium" | "long";
  }) => {
    setLoading(true);
    setError(null);
    setCopied(false);
    setCopiedCaption(false);

    setCountdown(6);
    setLoadingProgress(5);
    setStepMessage("🧠 AI กำลังวิเคราะห์สินค้าและกลุ่มเป้าหมาย...");

    const totalEstimateSec = 6;
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;

      // Adaptive Remaining Countdown: Smoothly count down and stay at 1s if response takes longer
      let remainingSec = Math.ceil(totalEstimateSec - elapsedSec);
      if (remainingSec <= 0) {
        remainingSec = 1;
      }
      setCountdown(remainingSec);

      // Smooth Adaptive Progress Bar
      let newProgress = 5;
      if (elapsedSec <= 4.5) {
        newProgress = Math.round(5 + (elapsedSec / 4.5) * 80);
      } else {
        newProgress = Math.min(96, Math.round(85 + (elapsedSec - 4.5) * 3));
      }
      setLoadingProgress(newProgress);

      if (elapsedSec < 1.8) {
        setStepMessage("🧠 AI กำลังวิเคราะห์จุดขายสินค้าและกลุ่มเป้าหมาย...");
      } else if (elapsedSec < 4.2) {
        setStepMessage("✍️ Master Copywriter กำลังคิด Hook และบทพูดพากย์...");
      } else {
        setStepMessage("🎬 กำลังจัดตาราง B-Roll, แคปชัน และเตรียมผลลัพธ์ขั้นตอนสุดท้าย...");
      }
    }, 100);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthModalOpen(true);
          return;
        }
        if (data.quotaExceeded || response.status === 403) {
          const quotaMsg = data.error || "คุณใช้สิทธิ์ทดลองฟรีครบ 7 ครั้งแล้ว! อัปเกรดเป็น Pro Plan เพียง 199.- เพื่อสร้างสคริปต์ไม่อั้น 200 ครั้ง/เดือน + ปลดล็อกตาราง B-Roll";
          setError(quotaMsg);
          openUpgradeModal("pro", quotaMsg);
          return;
        }
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างสคริปต์");
      }

      setLoadingProgress(100);
      setCountdown(0);

      const rawScript = data.script || "";
      setGeneratedScript(rawScript);
      setEditedScript(rawScript);
      setScriptMode("original");
      setShotList(data.shot_list || []);
      setHooksList(data.hooks || []);
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
      clearInterval(timerInterval);
      setLoading(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim()) {
      setError("กรุณากรอกชื่อสินค้าที่ต้องการรีวิว");
      return;
    }

    const currentForm = {
      product_name: productName,
      target_audience: targetAudience,
      product_link_or_extra: productLinkOrExtra,
      tone_style: toneStyle,
      script_length: scriptLength,
    };

    // Guest Auth Intercept
    if (!usage || usage.user_type === "guest") {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pending_script_form", JSON.stringify(currentForm));
      }
      setIsAuthModalOpen(true);
      return;
    }

    await triggerScriptGeneration(currentForm);
  };

  const activeScriptText = scriptMode === "custom" ? editedScript : (generatedScript || "");

  const handleCopyScript = async () => {
    if (!activeScriptText) return;
    try {
      await navigator.clipboard.writeText(activeScriptText);
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
    setEditedScript("");
    setScriptMode("original");
    setShotList([]);
    setCaption("");
    setHashtags("");
    setPinnedComment("");
    setError(null);
    setCopied(false);
  };

  const wordCount = activeScriptText
    ? activeScriptText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const charCount = activeScriptText ? activeScriptText.length : 0;

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

        {/* Usage status badge bar (hidden for guests) */}
        {usage && usage.user_type !== "guest" && (
          <div className="pt-1">
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
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold min-h-[44px]">
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    สมาชิก Plus:{" "}
                    <strong className="text-white">
                      เหลือ {usage.remaining} / {usage.limit} ครั้ง
                    </strong>
                  </span>
                </span>
                <Link
                  href="/history"
                  className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer min-h-[44px]"
                >
                  <History className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>ดูประวัติสคริปต์</span>
                </Link>
                <button
                  onClick={() => openUpgradeModal("pro")}
                  className="px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center space-x-1 cursor-pointer min-h-[44px]"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                  <span>อัปเกรด Pro Workflow (199.-)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium min-h-[44px]">
                  <BarChart2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    สิทธิ์ฟรีสัปดาห์นี้:{" "}
                    <strong className="text-white">
                      เหลือ {usage.remaining} / {usage.limit} ครั้ง
                    </strong>
                  </span>
                </span>
                <Link
                  href="/history"
                  className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer min-h-[44px]"
                >
                  <History className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>ดูประวัติสคริปต์</span>
                </Link>
                <button
                  onClick={() => openUpgradeModal("plus")}
                  className="px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  <span>Plus (99.-)</span>
                </button>
                <button
                  onClick={() => openUpgradeModal("pro")}
                  className="px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center space-x-1 cursor-pointer min-h-[44px]"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                  <span>Pro Workflow (199.-)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Input Form Card */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-800/80 shadow-2xl bg-slate-950/80 backdrop-blur-xl space-y-4 sm:space-y-6">
        {/* Low Quota / Expiration Warning Banner (hidden for guests & admins) */}
        {usage && usage.user_type !== "admin" && usage.user_type !== "guest" && usage.remaining !== "unlimited" && typeof usage.remaining === "number" && usage.remaining <= 5 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center space-x-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <span className="leading-relaxed">
                {usage.remaining === 0
                  ? "⚠️ โควต้าสร้างสคริปต์รอบนี้ของคุณหมดแล้ว! กดต่ออายุเพื่อใช้งานสคริปต์ต่อเนื่องได้ทันที"
                  : `⚠️ สิทธิ์สร้างสคริปต์ในรอบนี้ใกล้หมดแล้ว (เหลือสร้างได้อีก ${usage.remaining} ครั้ง)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openUpgradeModal(usage.user_type === "plus" ? "pro" : "plus")}
              className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md transition text-center"
            >
              {usage.user_type === "plus" ? "อัปเกรด Pro ⚡" : "ต่ออายุแพ็กเกจ ⚡"}
            </button>
          </div>
        )}

        {successBanner && (
          <div className="relative p-3.5 sm:p-5 pr-9 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/50 text-amber-100 text-xs sm:text-sm font-semibold shadow-2xl shadow-amber-500/15 animate-in fade-in zoom-in-95 backdrop-blur-md">
            <button
              onClick={() => setSuccessBanner(null)}
              className="absolute top-2.5 right-2.5 text-amber-400 hover:text-amber-200 p-1.5 rounded-xl hover:bg-amber-500/20 transition cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0 ring-2 ring-amber-300/40 mt-0.5 sm:mt-0">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
              </div>
              <div className="space-y-1 min-w-0 pr-1">
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                  <span>การชำระเงินสำเร็จ 100%</span>
                </div>
                <p className="text-xs sm:text-base font-bold text-slate-100 leading-relaxed">
                  ยินดีด้วย! บัญชีของคุณถูกอัปเกรดเป็น{" "}
                  <strong className="text-amber-300 font-extrabold underline decoration-amber-400 decoration-2 underline-offset-2">
                    {successBanner.plan === "pro"
                      ? "Pro Plan (200 ครั้ง/เดือน)"
                      : "Plus Plan (100 ครั้ง/เดือน)"}
                  </strong>{" "}
                  เรียบร้อยแล้ว ✨
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-2">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-semibold">{error}</span>
              </div>
            </div>
            {error.includes("อัปเกรด") && (
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

        <form onSubmit={handleGenerate} className="space-y-4 sm:space-y-6">
          {/* Field 1: Product Name */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="block text-sm font-semibold text-purple-300">
                🛒 ชื่อสินค้าที่ต้องการรีวิว{" "}
                <span className="text-purple-400 font-normal">* จำเป็น</span>
              </label>

              <button
                type="button"
                onClick={() => setIsAnalyzerModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 hover:from-purple-500/30 hover:to-amber-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer shadow-sm min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                <span>ให้ AI ช่วยวิเคราะห์สินค้า & แนะนำกลุ่มเป้าหมาย ✨</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder='เช่น "ครีมกันแดด Dr.Pong สูตรไฮยา คุมมัน กันน้ำ"'
              className="w-full px-4 py-3.5 text-sm sm:text-base rounded-2xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px]"
            />
          </div>

          {/* Field 1.5: Script Length Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-purple-300">
              ⏱️ เลือกความยาวสคริปต์ (Script Length)
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setScriptLength("short")}
                className={`p-2.5 xs:p-3 rounded-2xl border text-center transition-all cursor-pointer min-h-[48px] flex flex-col items-center justify-center ${
                  scriptLength === "short"
                    ? "bg-purple-600/25 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-purple-500/40"
                }`}
              >
                <div className="text-xs sm:text-sm font-bold text-slate-100">⚡ สั้น</div>
                <div className="text-[10px] xs:text-[11px] text-slate-400 mt-0.5">~15-30 วินาที</div>
                <div className="text-[10px] text-purple-300/80 mt-1 hidden sm:block">กระชับ ปิดขายด่วน</div>
              </button>

              <button
                type="button"
                onClick={() => setScriptLength("medium")}
                className={`p-2.5 xs:p-3 rounded-2xl border text-center transition-all cursor-pointer min-h-[48px] flex flex-col items-center justify-center ${
                  scriptLength === "medium"
                    ? "bg-purple-600/25 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-purple-500/40"
                }`}
              >
                <div className="text-xs sm:text-sm font-bold text-slate-100">🎬 ปกติ</div>
                <div className="text-[10px] xs:text-[11px] text-slate-400 mt-0.5">~30-60 วินาที</div>
                <div className="text-[10px] text-purple-300/80 mt-1 hidden sm:block">เล่าเรื่องสมดุล</div>
              </button>

              <button
                type="button"
                onClick={() => setScriptLength("long")}
                className={`p-2.5 xs:p-3 rounded-2xl border text-center transition-all cursor-pointer min-h-[48px] flex flex-col items-center justify-center ${
                  scriptLength === "long"
                    ? "bg-purple-600/25 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-purple-500/40"
                }`}
              >
                <div className="text-xs sm:text-sm font-bold text-slate-100">📖 ยาว</div>
                <div className="text-[10px] xs:text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">~60-90+s</div>
                <div className="text-[10px] text-purple-300/80 mt-1 hidden sm:block">เจาะลึก+สาธิต</div>
              </button>
            </div>
          </div>

          {/* Field 2: Tone of Voice Selection (Multi-Tiered 10 Tones) */}
          <div className="space-y-3">
            {/* AI Brain Upsell Banner / Button */}
            {!isProOrAdmin && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/35 shadow-lg shadow-amber-500/5 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-amber-200 truncate">
                      {isPlusUser
                        ? "สเปกสมอง AI (คุณใช้งาน Plus Plan อยู่ 🔵)"
                        : "ความสามารถสมอง AI สายฟรี vs Pro Plan"}
                    </div>
                    <p className="text-[11px] text-slate-400 hidden xs:block">
                      อัปเกรดเพื่อรับสคริปต์ปิดการขาย Master Copywriter 20 เท่า
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBrainModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <span>ดูข้อแตกต่างสมอง AI ⚡</span>
                </button>
              </div>
            )}

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
              className="w-full px-4 py-3.5 text-sm sm:text-base rounded-2xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px]"
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
              className="w-full px-4 py-3.5 text-sm sm:text-base rounded-2xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-xl shadow-purple-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center min-h-[52px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white shrink-0" />
                <span>กำลังคิดสคริปต์ + ตาราง B-Roll ด้วย AI...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-white fill-white shrink-0" />
                <span>สร้างสคริปต์รีวิวสินค้า</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Live Countdown & Progress Card */}
      {loading && (
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-purple-500/40 shadow-2xl bg-slate-950/95 space-y-3 sm:space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 sm:mt-0">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-purple-400" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {stepMessage}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                  กำลังออกแบบสคริปต์ + ตาราง B-Roll ด้วย AI
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black flex items-center space-x-1.5 shrink-0 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>อีกประมาณ {countdown} วินาที</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300 shadow-md shadow-purple-500/30"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span>กำลังประมวลผล...</span>
              <span>{loadingProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Output Display Card */}
      {generatedScript && (
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
                  className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold shadow transition flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px] ${
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
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] shrink-0">
                      PRO
                    </span>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer shrink-0 flex items-center justify-center"
                  title="เริ่มใหม่"
                  aria-label="Reset"
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
                className={`px-3.5 sm:px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shrink-0 min-h-[44px] ${
                  activeTab === "script"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>บทพูดพากย์เสียง</span>
              </button>

              <button
                onClick={() => setActiveTab("shotlist")}
                className={`px-3.5 sm:px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shrink-0 min-h-[44px] ${
                  activeTab === "shotlist"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>ตารางถ่าย B-Roll</span>
                {!isProOrAdmin && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] shrink-0">
                    PRO
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("caption")}
                className={`px-3.5 sm:px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shrink-0 min-h-[44px] ${
                  activeTab === "caption"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Hash className="w-4 h-4 text-amber-400 shrink-0" />
                <span>แคปชัน & แฮชแท็ก</span>
                {!isProOrAdmin && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] shrink-0">
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
                  {/* Mode Selector Sub-header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800/60">
                    <div className="flex items-center space-x-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setScriptMode("original")}
                        className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
                          scriptMode === "original"
                            ? "bg-purple-600/25 text-purple-300 border border-purple-500/40 font-bold shadow"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>📜 ต้นฉบับ AI (Read-Only)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!editedScript) setEditedScript(generatedScript || "");
                          setScriptMode("custom");
                        }}
                        className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
                          scriptMode === "custom"
                            ? "bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold shadow"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>✏️ สคริปต์ที่ปรับแต่งเอง</span>
                      </button>
                    </div>

                    {scriptMode === "original" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!editedScript) setEditedScript(generatedScript || "");
                          setScriptMode("custom");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>คัดลอกไปแก้ไขบทพูด</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditedScript(generatedScript || "");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>รีเซ็ตกลับเป็นต้นฉบับ AI</span>
                      </button>
                    )}
                  </div>

                  {/* 3 Hook Options Section (Pro Tier Feature) */}
                  {isProOrAdmin ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-amber-500/40 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                            PRO
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center space-x-1.5">
                              <span>🎯 ทางเลือกคำเปิด 3 สไตล์ (3 Hook Options 0-3 วินาทีแรก)</span>
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              เปรียบเทียบจุดเด่นของแต่ละ Hook เพื่อเลือกสไตล์ประโยคเปิดคลิปที่ตรงใจที่สุด
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 3 Distinct Hook Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* Hook A */}
                        <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-950/40 to-slate-950 border border-emerald-500/40 space-y-2.5 flex flex-col justify-between shadow-md">
                          <div className="space-y-2">
                            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black inline-block">
                              👁️ Hook A: สายเน้นภาพ & Action
                            </div>
                            <p className="text-[11px] text-emerald-200/80 font-medium leading-relaxed">
                              💡 โชว์ช็อตสินค้า หรือการกระทำตื่นเต้น 3 วินาทีแรก เพื่อหยุดนิ้วคนดูบนฟีด
                            </p>
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-100 font-semibold leading-relaxed selection:bg-emerald-500/30 min-h-[60px]">
                              {getDisplayHooks()[0]?.text || hooksList[0]?.text || "อย่าเพิ่งซื้อสินค้าตัวนี้ ถ้ายังไม่ได้ดูคลิปนี้จนจบ!"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const text = getDisplayHooks()[0]?.text || hooksList[0]?.text;
                              if (text) {
                                navigator.clipboard.writeText(text);
                                setCopiedHookId("A");
                                setTimeout(() => setCopiedHookId(null), 2000);
                              }
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow min-h-[44px]"
                          >
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>{copiedHookId === "A" ? "คัดลอก Hook A แล้ว! ✨" : "คัดลอกเฉพาะ Hook A"}</span>
                          </button>
                        </div>

                        {/* Hook B */}
                        <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-950 border border-indigo-500/40 space-y-2.5 flex flex-col justify-between shadow-md">
                          <div className="space-y-2">
                            <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black inline-block">
                              🗣️ Hook B: สายเน้นสะกิดแผลจี้ปัญหา
                            </div>
                            <p className="text-[11px] text-indigo-200/80 font-medium leading-relaxed">
                              💡 ตั้งคำถามแทงใจดำ ชี้จุดเจ็บเรื่องปัญหาที่กลุ่มเป้าหมายกำลังเดือดร้อนอยู่
                            </p>
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-100 font-semibold leading-relaxed selection:bg-indigo-500/30 min-h-[60px]">
                              {getDisplayHooks()[1]?.text || hooksList[1]?.text || "ใครเคยเจอปัญหานี้บ้าง? ลองมาหลายวิธีก็ไม่ดีขึ้นสักที..."}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const text = getDisplayHooks()[1]?.text || hooksList[1]?.text;
                              if (text) {
                                navigator.clipboard.writeText(text);
                                setCopiedHookId("B");
                                setTimeout(() => setCopiedHookId(null), 2000);
                              }
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow min-h-[44px]"
                          >
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>{copiedHookId === "B" ? "คัดลอก Hook B แล้ว! ✨" : "คัดลอกเฉพาะ Hook B"}</span>
                          </button>
                        </div>

                        {/* Hook C */}
                        <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-950 border border-amber-500/40 space-y-2.5 flex flex-col justify-between shadow-md">
                          <div className="space-y-2">
                            <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black inline-block">
                              ⚡ Hook C: สายเน้นช็อก & ทลายความเชื่อ
                            </div>
                            <p className="text-[11px] text-amber-200/80 font-medium leading-relaxed">
                              💡 เปิดด้วยเรื่องน่าทึ่ง หรือข้อผิดพลาดที่คน 90% เข้าใจผิดชวนเอ๊ะอึ้ง
                            </p>
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs text-slate-100 font-semibold leading-relaxed selection:bg-amber-500/30 min-h-[60px]">
                              {getDisplayHooks()[2]?.text || hooksList[2]?.text || "รู้ไหมว่าคนส่วนใหญ่ 90% กำลังเลือกใช้สินค้าผิดวิธี!"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const text = getDisplayHooks()[2]?.text || hooksList[2]?.text;
                              if (text) {
                                navigator.clipboard.writeText(text);
                                setCopiedHookId("C");
                                setTimeout(() => setCopiedHookId(null), 2000);
                              }
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center space-x-1.5 cursor-pointer shadow min-h-[44px]"
                          >
                            <Copy className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                            <span>{copiedHookId === "C" ? "คัดลอก Hook C แล้ว! ✨" : "คัดลอกเฉพาะ Hook C"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-amber-300 flex items-center space-x-1.5">
                          <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                          <span>ปลดล็อก 3 Hook Options (0-3 วินาทีแรก) ด้วย Pro Plan!</span>
                        </p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          เปรียบเทียบคำเปิดคลิป 3 สไตล์ (Visual Action / Pain-Point / Shocking Contrast) เลือกคำเปิดที่ดึงดูดสายตาที่สุดได้ทันที
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openUpgradeModal("pro")}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow transition text-center min-h-[44px] flex items-center justify-center"
                      >
                        อัปเกรด Pro ⚡
                      </button>
                    </div>
                  )}

                  {/* Main Script Text Box (Read-Only vs Editable Textarea) */}
                  {scriptMode === "original" ? (
                    <div className="p-4 xs:p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm sm:text-lg leading-relaxed whitespace-pre-wrap break-words font-sans selection:bg-purple-500/30">
                      {generatedScript}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={editedScript}
                        onChange={(e) => setEditedScript(e.target.value)}
                        placeholder="พิมพ์หรือปรับแต่งบทพูดของคุณตรงนี้..."
                        rows={10}
                        className="w-full p-4 xs:p-5 sm:p-6 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-amber-100 text-sm sm:text-lg leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/30 selection:bg-amber-500/30 transition-all resize-y break-words"
                      />
                      <p className="text-[11px] text-amber-300/80 italic">
                        💡 ข้อความที่คุณแก้ไขตรงนี้ จะถูกส่งต่อไปแสดงบนเครื่องอ่านบท (Teleprompter) ให้อัตโนมัติ
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2">
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
                      className={`w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer min-h-[44px] ${
                        copied
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : scriptMode === "custom"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                          : "bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 shrink-0" />
                          <span>{scriptMode === "custom" ? "คัดลอกสคริปต์ที่แก้ไข" : "คัดลอกสคริปต์ต้นฉบับ"}</span>
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
                          <p className="text-xs text-amber-300 font-bold">
                            ปลดล็อกตารางกำกับภาพ Shot-by-Shot + โหมดอ่านบทขณะอัดคลิป เพียง 199.-/เดือน
                          </p>
                          <p className="text-xs text-slate-300">
                            ตาราง Shot-by-Shot แยกมุมกล้อง คำพูด และซับกลางจอของสินค้าคุณถูกล็อกไว้ ปลดล็อกเพื่อดูรายละเอียดฉบับเต็ม!
                          </p>
                        </div>
                        <button
                          onClick={() => openUpgradeModal("pro", "ปลดล็อกตารางกำกับภาพ Shot-by-Shot + โหมดอ่านบทขณะอัดคลิป เพียง 199.-/เดือน")}
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
                                <span className="font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>{item.time}</span>
                                </span>
                                <span className="text-emerald-300 font-bold text-[11px] truncate max-w-[180px] flex items-center space-x-1">
                                  <Pin className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span>{item.text_on_screen}</span>
                                </span>
                              </div>
                              <div className="space-y-1.5 text-slate-200">
                                <p className="leading-relaxed flex items-start space-x-1.5">
                                  <Video className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                  <span><strong className="text-purple-300 font-semibold">ภาพ B-Roll:</strong> {item.visual}</span>
                                </p>
                                <p className="leading-relaxed text-slate-300 flex items-start space-x-1.5">
                                  <Mic className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                  <span><strong className="text-indigo-300 font-semibold">เสียงพูด:</strong> {item.audio}</span>
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
                                <th className="p-3 sm:p-4 w-2/5 min-w-[180px]">ภาพที่ต้องถ่าย (B-Roll)</th>
                                <th className="p-3 sm:p-4 w-2/5 min-w-[200px]">เสียงพูด</th>
                                <th className="p-3 sm:p-4 w-1/5 min-w-[140px]">ขึ้นซับกลางจอ</th>
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
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center space-x-1.5">
                            <Pin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>แคปชันสำหรับโพสต์คลิป (Caption)</span>
                          </h4>
                          <p className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 leading-relaxed">
                            {caption || `รีวิว ${productName} คุ้มค่าตอบโจทย์ชัวร์!`}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wide flex items-center space-x-1.5">
                            <Hash className="w-3.5 h-3.5 text-purple-400" />
                            <span>แฮชแท็กดันฟีดติดเทรนด์ (Hashtags)</span>
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
        onClose={() => {
          setIsProModalOpen(false);
          setModalCustomMessage(undefined);
        }}
        defaultPlan={modalDefaultPlan}
        currentPlan={usage?.user_type}
        customMessage={modalCustomMessage}
      />

      {/* Teleprompter Modal */}
      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        scriptText={activeScriptText}
        productName={productName}
        isDemo={!isProOrAdmin}
        onUpgradeClick={() => openUpgradeModal("pro")}
      />

      {/* AI Brain Comparison Modal */}
      <AIBrainComparisonModal
        isOpen={isBrainModalOpen}
        onClose={() => setIsBrainModalOpen(false)}
        currentPlan={usage?.user_type}
        onUpgradeClick={(plan) => openUpgradeModal(plan)}
      />

      {/* Product Analyzer Modal */}
      <ProductAnalyzerModal
        isOpen={isAnalyzerModalOpen}
        onClose={() => setIsAnalyzerModalOpen(false)}
        onApplyAnalysis={(data) => {
          if (data.productName) setProductName(data.productName);
          if (data.targetAudience) setTargetAudience(data.targetAudience);
          if (data.extraInfo) setProductLinkOrExtra(data.extraInfo);
        }}
        userPlan={usage?.user_type}
        onUpgradeClick={(plan) => openUpgradeModal(plan)}
      />

      {/* Auth Modal for Try-Before-Login PLG Flow */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={async () => {
          await fetchUsage();
          let formToUse = {
            product_name: productName,
            target_audience: targetAudience,
            product_link_or_extra: productLinkOrExtra,
            tone_style: toneStyle,
            script_length: scriptLength,
          };
          if (typeof window !== "undefined") {
            const pendingStr = sessionStorage.getItem("pending_script_form");
            if (pendingStr) {
              try {
                const parsed = JSON.parse(pendingStr);
                sessionStorage.removeItem("pending_script_form");
                formToUse = { ...formToUse, ...parsed };
                if (parsed.product_name) setProductName(parsed.product_name);
                if (parsed.target_audience) setTargetAudience(parsed.target_audience);
                if (parsed.product_link_or_extra) setProductLinkOrExtra(parsed.product_link_or_extra);
                if (parsed.tone_style) setToneStyle(parsed.tone_style);
                if (parsed.script_length) setScriptLength(parsed.script_length);
              } catch (e) {
                console.error("Pending form parse error:", e);
              }
            }
          }
          if (formToUse.product_name) {
            triggerScriptGeneration(formToUse);
          }
        }}
      />
    </div>
  );
}
