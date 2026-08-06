"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Pencil,
  History,
  LogOut,
  User,
  Crown,
  Star,
  Sparkles,
  Edit2,
} from "lucide-react";
import EditDisplayNameModal from "./EditDisplayNameModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [planType, setPlanType] = useState<string>("free");
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const supabase = createClient();

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user-profile");
      if (res.ok) {
        const data = await res.json();
        setDisplayName(data.display_name);
        setPlanType(data.plan_type);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(
          currentUser.user_metadata?.display_name ||
            currentUser.email?.split("@")[0] ||
            "ผู้ใช้งาน"
        );
        fetchProfile();
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setDisplayName(
          session.user.user_metadata?.display_name ||
            session.user.email?.split("@")[0] ||
            "ผู้ใช้งาน"
        );
        fetchProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isCurrent = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isCurrent("/dashboard")
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Pencil className="w-4 h-4" />
              <span>สร้างสคริปต์</span>
            </Link>

            {user && (
              <Link
                href="/history"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isCurrent("/history")
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <History className="w-4 h-4" />
                <span>ประวัติการสร้าง</span>
              </Link>
            )}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Clickable Profile Badge with PRO / ADMIN Indicator */}
                <button
                  onClick={() => setIsEditNameModalOpen(true)}
                  title="คลิกเพื่อแก้ไขชื่อผู้ใช้งาน"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-200 font-medium transition group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="max-w-[120px] sm:max-w-[160px] truncate font-semibold">
                    {displayName}
                  </span>

                  {/* Plan Badge */}
                  {planType === "admin" ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">
                      <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>ADMIN</span>
                    </span>
                  ) : planType === "pro" ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                      <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                      <span>PRO</span>
                    </span>
                  ) : null}

                  <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition ml-0.5" />
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 transition"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Edit Display Name Modal */}
      <EditDisplayNameModal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        currentDisplayName={displayName}
        onNameUpdated={(newName) => {
          setDisplayName(newName);
        }}
      />
    </>
  );
}
