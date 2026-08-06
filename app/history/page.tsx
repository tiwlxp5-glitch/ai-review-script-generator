"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  History,
  Search,
  Copy,
  Check,
  Trash2,
  Calendar,
  Target,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  Video,
  Lock,
  Clapperboard,
  Hash,
  Crown,
} from "lucide-react";
import UpgradeProModal from "@/components/UpgradeProModal";
import TeleprompterModal from "@/components/TeleprompterModal";

interface ShotItem {
  time: string;
  visual: string;
  audio: string;
  text_on_screen: string;
}

interface ScriptHistoryItem {
  id: string;
  user_id: string;
  product_name: string;
  target_audience: string;
  script_content: string;
  shot_list?: ShotItem[];
  caption?: string;
  hashtags?: string;
  pinned_comment?: string;
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [historyItems, setHistoryItems] = useState<ScriptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // User status
  const [userType, setUserType] = useState<string>("free");
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [activeTeleprompterItem, setActiveTeleprompterItem] = useState<ScriptHistoryItem | null>(null);

  // Active tab map per card ID
  const [activeTabMap, setActiveTabMap] = useState<Record<string, "script" | "shotlist" | "caption">>({});

  useEffect(() => {
    fetchHistoryAndUsage();
  }, []);

  const fetchHistoryAndUsage = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch user usage status
      try {
        const usageRes = await fetch("/api/user-usage");
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUserType(usageData.user_type);
        }
      } catch (uErr) {
        console.error("Failed to fetch user usage in history:", uErr);
      }

      // Fetch history items
      const { data, error: fetchErr } = await supabase
        .from("script_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      setHistoryItems(data || []);
    } catch (err: any) {
      console.error("Failed to fetch script history:", err);
      setError("ไม่สามารถโหลดประวัติการสร้างสคริปต์ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error("Failed to copy script:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสคริปต์นี้?")) {
      return;
    }

    setDeletingId(id);
    try {
      const { error: deleteErr } = await supabase
        .from("script_history")
        .delete()
        .eq("id", id);

      if (deleteErr) {
        throw deleteErr;
      }

      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error("Failed to delete history item:", err);
      alert("เกิดข้อผิดพลาดในการลบสคริปต์");
    } finally {
      setDeletingId(null);
    }
  };

  const isProOrAdmin = userType === "pro" || userType === "admin";

  const getActiveTab = (id: string) => activeTabMap[id] || "script";
  const setActiveTab = (id: string, tab: "script" | "shotlist" | "caption") => {
    setActiveTabMap((prev) => ({ ...prev, [id]: tab }));
  };

  const filteredItems = historyItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(query) ||
      item.target_audience.toLowerCase().includes(query) ||
      item.script_content.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ประวัติการสร้างสคริปต์
              </h1>
              <p className="text-sm text-slate-400">
                รายการสคริปต์รีวิวทั้งหมดที่คุณเคยสร้างไว้
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อสินค้า หรือกลุ่มเป้าหมาย..."
            className="glass-input w-full pl-10 pr-4 py-2 text-sm rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-sm text-slate-400">กำลังโหลดประวัติสคริปต์...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h3 className="font-semibold text-base">เกิดข้อผิดพลาด</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-2xl p-8 border border-slate-800">
          <div className="inline-flex p-4 rounded-2xl bg-slate-900 text-slate-500 mb-4 border border-slate-800">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">
            {searchQuery ? "ไม่พบสคริปต์ที่ตรงกับคำค้นหา" : "ยังไม่มีประวัติการสร้างสคริปต์"}
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2">
            {searchQuery
              ? "ลองเปลี่ยนคำค้นหาเพื่อค้นหาสคริปต์อื่นที่คุณสร้างไว้"
              : "เริ่มต้นสร้างสคริปต์รีวิวสินค้าชิ้นแรกของคุณด้วย AI ได้เลย"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างสคริปต์ใหม่</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const currentTab = getActiveTab(item.id);
            const shotList = item.shot_list && Array.isArray(item.shot_list) ? item.shot_list : [];

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-6 border border-slate-800/80 shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200 group space-y-4"
              >
                {/* Card Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs">
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-medium text-slate-300">สินค้า</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2">
                        {item.product_name}
                      </h3>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {/* Teleprompter Button */}
                      <button
                        onClick={() => setActiveTeleprompterItem(item)}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                          isProOrAdmin
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                        }`}
                        title={isProOrAdmin ? "เปิดโหมดอ่านบท" : "ทดลองโหมดอ่านบท (Demo)"}
                      >
                        <Video className="w-4 h-4 fill-current text-amber-400" />
                        <span className="hidden sm:inline">อ่านบท</span>
                        {!isProOrAdmin && <Lock className="w-3 h-3 text-amber-400" />}
                      </button>

                      <button
                        onClick={() => handleCopy(item.id, item.script_content)}
                        className={`p-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          copiedId === item.id
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                        }`}
                        title="คัดลอกสคริปต์"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all disabled:opacity-50 cursor-pointer"
                        title="ลบสคริปต์"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Target Audience Badge */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      <span>กลุ่มเป้าหมาย:</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2 pl-5">
                      {item.target_audience}
                    </p>
                  </div>

                  {/* Feature Navigation Tabs */}
                  <div className="flex items-center space-x-1 border-b border-slate-800/80 pb-2 text-xs font-semibold overflow-x-auto">
                    <button
                      onClick={() => setActiveTab(item.id, "script")}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                        currentTab === "script"
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🗣️ บทพูด
                    </button>

                    <button
                      onClick={() => setActiveTab(item.id, "shotlist")}
                      className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition whitespace-nowrap cursor-pointer ${
                        currentTab === "shotlist"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Clapperboard className="w-3.5 h-3.5" />
                      <span>ตาราง B-Roll</span>
                      {!isProOrAdmin && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px]">
                          PRO
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab(item.id, "caption")}
                      className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition whitespace-nowrap cursor-pointer ${
                        currentTab === "caption"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" />
                      <span>แคปชัน</span>
                      {!isProOrAdmin && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px]">
                          PRO
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Tab 1: Script Voiceover Content */}
                  {currentTab === "script" && (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                      {item.script_content}
                    </div>
                  )}

                  {/* Tab 2: Visual Shot-List Table (B-Roll) */}
                  {currentTab === "shotlist" && (
                    <div>
                      {!isProOrAdmin ? (
                        <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950/90 p-1">
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md text-center space-y-2">
                            <Lock className="w-5 h-5 text-amber-400" />
                            <p className="text-xs font-bold text-white">ตาราง B-Roll ถูกล็อกสำหรับผู้ใช้ Pro</p>
                            <button
                              onClick={() => setIsProModalOpen(true)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center space-x-1 cursor-pointer"
                            >
                              <Crown className="w-3.5 h-3.5 fill-slate-950" />
                              <span>ปลดล็อก Pro (199.-)</span>
                            </button>
                          </div>
                          <div className="filter blur-md select-none pointer-events-none opacity-20 p-2 text-xs">
                            <p className="font-bold text-amber-400">0-3s | 🎥 ซูมสินค้า | 🗣️ "อย่าเพิ่งเลื่อน..."</p>
                            <p className="font-bold text-amber-400">3-7s | 🎥 สาธิตการใช้ | 🗣️ "ผลลัพธ์ว้าวมาก..."</p>
                          </div>
                        </div>
                      ) : shotList.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-purple-300 font-bold border-b border-slate-800">
                              <tr>
                                <th className="p-2.5">เวลา</th>
                                <th className="p-2.5">🎥 ภาพ B-Roll</th>
                                <th className="p-2.5">🗣️ เสียงพูด</th>
                                <th className="p-2.5">📝 ซับกลางจอ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-950/60 text-slate-200">
                              {shotList.map((shot, idx) => (
                                <tr key={idx}>
                                  <td className="p-2.5 font-mono text-amber-400 font-bold whitespace-nowrap">{shot.time}</td>
                                  <td className="p-2.5">{shot.visual}</td>
                                  <td className="p-2.5 text-slate-300">{shot.audio}</td>
                                  <td className="p-2.5 text-emerald-300 font-semibold">{shot.text_on_screen}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/80 rounded-xl border border-slate-800">
                          <p>ไม่มีตาราง Shot-List แยกสำหรับรายการนี้</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: TikTok Caption & Hashtags */}
                  {currentTab === "caption" && (
                    <div>
                      {!isProOrAdmin ? (
                        <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950/90 p-4">
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md text-center space-y-2">
                            <Lock className="w-5 h-5 text-amber-400" />
                            <p className="text-xs font-bold text-white">แคปชันและแฮชแท็กถูกล็อกสำหรับผู้ใช้ Pro</p>
                            <button
                              onClick={() => setIsProModalOpen(true)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center space-x-1 cursor-pointer"
                            >
                              <Crown className="w-3.5 h-3.5 fill-slate-950" />
                              <span>ปลดล็อก Pro (199.-)</span>
                            </button>
                          </div>
                          <div className="filter blur-md select-none pointer-events-none opacity-20 text-xs space-y-2">
                            <p className="text-emerald-400">📌 แคปชัน: ต้องลองตัวนี้เลยแก...</p>
                            <p className="text-purple-400">🏷️ แฮชแท็ก: #รีวิวสินค้า #TikTokShop</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 text-slate-200">
                          <div>
                            <span className="font-bold text-emerald-400">📌 แคปชัน: </span>
                            <span>{item.caption || `รีวิว ${item.product_name} คุ้มค่าตอบโจทย์!`}</span>
                          </div>
                          <div>
                            <span className="font-bold text-purple-400">🏷️ แฮชแท็ก: </span>
                            <span className="font-mono text-purple-300">{item.hashtags || "#TikTokShop #รีวิวของดีบอกต่อ"}</span>
                          </div>
                          <div>
                            <span className="font-bold text-amber-400">💬 ปักตะกร้า: </span>
                            <span className="text-amber-200">{item.pinned_comment || "กดที่ตะกร้าเหลืองซ้ายล่างได้เลยครับ!"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {item.script_content.trim().split(/\s+/).filter(Boolean).length} คำ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teleprompter Modal */}
      <TeleprompterModal
        isOpen={!!activeTeleprompterItem}
        onClose={() => setActiveTeleprompterItem(null)}
        scriptText={activeTeleprompterItem?.script_content || ""}
        productName={activeTeleprompterItem?.product_name || ""}
        isDemo={!isProOrAdmin}
        onUpgradeClick={() => setIsProModalOpen(true)}
      />

      {/* Upgrade Pro Modal */}
      <UpgradeProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        defaultPlan="pro"
        currentPlan={userType as any}
      />
    </div>
  );
}
