"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  FlipHorizontal,
  Type,
  Gauge,
  Video,
  Crown,
  Lock,
} from "lucide-react";

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  productName: string;
  isDemo?: boolean;
  onUpgradeClick?: () => void;
}

const DEMO_SCRIPT_TEXT = `🎥 [ตัวอย่างทดลองใช้โหมดอ่านบท Teleprompter]

ยินดีต้อนรับสู่เครื่องมืออ่านบทพูดหน้ากล้องสำหรับครีเอเตอร์!

เมื่อคุณอัปเกรดเป็น Pro ตัวหนังสือบทพูดของสินค้าคุณจริงๆ จะไหลขึ้นแบบนี้ตามระดับสายตาขณะอัดคลิป ช่วยให้คุณตั้งมือถือข้างเลนส์กล้อง อ่านบทได้ลื่นไหล ไม่ต้องท่องบทให้เสียเวลา ทำคลิปเสร็จไวขึ้น 3 เท่า!

ลองทดสอบกด Play / Pause ปรับความเร็วการไหล หรือปรับขนาดตัวหนังสือที่แถบควบคุมด้านล่างได้เลยครับ...`;

export default function TeleprompterModal({
  isOpen,
  onClose,
  scriptText,
  productName,
  isDemo = false,
  onUpgradeClick,
}: TeleprompterModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 to 10
  const [fontSize, setFontSize] = useState(28); // 20 to 60px
  const [isMirrored, setIsMirrored] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const displayText = isDemo ? DEMO_SCRIPT_TEXT : scriptText;

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    let lastTime = performance.now();

    const scrollStep = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.scrollTop += speed * 40 * delta;

        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 5
        ) {
          setIsPlaying(false);
        }
      }

      if (isPlaying) {
        animFrameIdRef.current = requestAnimationFrame(scrollStep);
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      animFrameIdRef.current = requestAnimationFrame(scrollStep);
    } else if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, speed]);

  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Screen Wake Lock API to prevent phone screen dimming
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        } catch (err) {
          console.warn("Wake Lock request failed:", err);
        }
      }
    };

    requestWakeLock();

    // 2. Keyboard shortcuts (Space to Play/Pause, Esc to Close)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResetScroll = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="fixed inset-0 h-dvh min-h-dvh z-50 flex flex-col bg-slate-950 text-white select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/90 z-20 min-h-[56px]">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5 sm:space-x-2 truncate">
              <span className="truncate">เครื่องอ่านบทพูด (Teleprompter)</span>
              {isDemo ? (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] font-bold border border-indigo-500/30 shrink-0">
                  DEMO
                </span>
              ) : (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-bold border border-amber-500/30 shrink-0">
                  PRO
                </span>
              )}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">
              {isDemo
                ? "ตัวอย่างทดลองระบบการอ่านบทพูด"
                : productName || "สคริปต์รีวิวสินค้า"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {isDemo && onUpgradeClick && (
            <button
              onClick={() => {
                onClose();
                onUpgradeClick();
              }}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-[11px] sm:text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center space-x-1 min-h-[44px]"
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 shrink-0" />
              <span>ปลดล็อกอ่านสคริปต์จริง (199.-)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Demo Watermark Banner */}
      {isDemo && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 text-center text-[11px] sm:text-xs text-amber-300 font-medium flex items-center justify-center space-x-1.5 z-20">
          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span>
            คุณกำลังทดลองโหมดอ่านบท (Demo) — อัปเกรดเป็น Pro เพื่ออ่านบทพูดจริงของสินค้าคุณ!
          </span>
        </div>
      )}

      {/* Main Teleprompter Text Display Area */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-4 xs:px-8 sm:px-16 md:px-24 py-16 sm:py-32 transition-transform duration-200 scroll-smooth ${
          isMirrored ? "scale-x-[-1]" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-8 text-center sm:text-left">
          <div
            className={`font-bold leading-relaxed tracking-wide whitespace-pre-wrap break-words font-sans transition-all ${
              isDemo ? "text-amber-200/90" : "text-amber-300"
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {displayText}
          </div>
          <div className="h-64" />
        </div>
      </div>

      {/* Floating Eye Center Guideline */}
      <div className="absolute top-1/2 left-0 right-0 h-14 sm:h-16 -translate-y-1/2 pointer-events-none border-y border-amber-500/20 bg-amber-500/5 flex items-center justify-between px-3 sm:px-4 z-10">
        <span className="text-[9px] sm:text-[10px] font-bold text-amber-400/60 uppercase tracking-widest">
          ◄ ระดับสายตาขณะพูด ◄
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold text-amber-400/60 uppercase tracking-widest">
          ► ระดับสายตาขณะพูด ►
        </span>
      </div>

      {/* Bottom Floating Controls Bar */}
      <div className="sticky bottom-0 z-20 px-3 sm:px-4 py-3 sm:py-4 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Play/Pause & Reset Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition shadow-lg flex items-center space-x-1.5 sm:space-x-2 min-h-[44px] cursor-pointer ${
              isPlaying
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span>หยุดชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span>ทดลองเลื่อนบท</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetScroll}
            className="w-11 h-11 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center justify-center shrink-0 cursor-pointer"
            title="วนกลับไปจุดเริ่มต้น"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Speed & Font Size & Mirror Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
          {/* Speed Slider */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 min-h-[44px]">
            <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400 text-[11px] sm:text-xs">ความเร็ว:</span>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-amber-400 cursor-pointer"
            />
            <span className="font-bold text-white w-6 text-center">{speed}x</span>
          </div>

          {/* Font Size Slider */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 min-h-[44px]">
            <Type className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400 text-[11px] sm:text-xs">ขนาดอักษร:</span>
            <input
              type="range"
              min="24"
              max="56"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-16 sm:w-20 accent-amber-400 cursor-pointer"
            />
            <span className="font-bold text-white w-6 text-center">{fontSize}px</span>
          </div>

          {/* Mirror Flip Toggle */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border transition min-h-[44px] cursor-pointer ${
              isMirrored
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <FlipHorizontal className="w-4 h-4 shrink-0" />
            <span>กลับด้าน (Mirror)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
