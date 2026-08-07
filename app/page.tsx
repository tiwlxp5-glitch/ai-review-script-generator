import Link from "next/link";
import { Sparkles, ArrowRight, Wand2, History, Zap, ShieldCheck, Video } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs sm:text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>ระบบช่วยคิดสคริปต์ขายของ TikTok & Reels ด้วย AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          เปลี่ยนสินค้าของคุณเป็น <br className="hidden sm:inline" />
          <span className="gradient-text">สคริปต์รีวิวที่ปิดการขายง่ายขึ้น</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          สร้างสคริปต์คลิปสั้นเจาะลึกกลุ่มเป้าหมายในไม่กี่วินาที ไม่ว่าจะเป็น TikTok, Instagram Reels หรือ YouTube Shorts
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-600/30 transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <span>ทดลองสร้างสคริปต์ฟรี (ไม่ต้องสมัครก่อน) ✨</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition text-center"
          >
            ไปที่เครื่องมือสร้างสคริปต์
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Wand2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">AI เจาะลึกกลุ่มเป้าหมาย</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            ระบุเพียงชื่อสินค้าและกลุ่มเป้าหมาย AI จะทำการวิเคราะห์ Pain Point และสร้างประโยคเปิดหัวเรื่อง (Hook) ที่ดึงดูดใจ
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">โครงสร้างสคริปต์พร้อมถ่าย</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            ออกแบบให้มีส่วน Hook, Problem, Solution และ Call to Action เหมาะสำหรับการอ่านบทพูดหน้ากล้องได้ทันที
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">จัดเก็บประวัติย้อนหลัง</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            ย้อนดูสคริปต์ที่เคยสร้าง ค้นหาตามชื่อสินค้า และกดคัดลอกพร้อมใช้งานได้ตลอดเวลา
          </p>
        </div>
      </section>
    </div>
  );
}
