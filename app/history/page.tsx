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
} from "lucide-react";

interface ScriptHistoryItem {
  id: string;
  user_id: string;
  product_name: string;
  target_audience: string;
  script_content: string;
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

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
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
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-6 border border-slate-800/80 shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200 group"
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

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleCopy(item.id, item.script_content)}
                      className={`p-2 rounded-xl text-xs font-medium transition-all ${
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
                      className="p-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all disabled:opacity-50"
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

                {/* Script Body Preview / Full Text */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                  {item.script_content}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {item.script_content.trim().split(/\s+/).filter(Boolean).length} คำ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
