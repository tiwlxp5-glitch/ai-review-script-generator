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
  Sparkles,
  Edit2,
  Menu,
  X,
} from "lucide-react";
import EditDisplayNameModal from "./EditDisplayNameModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [planType, setPlanType] = useState<string>("free");
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const handleProfileUpdateEvent = () => {
      fetchProfile();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("profileUpdated", handleProfileUpdateEvent);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("profileUpdated", handleProfileUpdateEvent);
      }
    };
  }, [supabase]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isCurrent = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-16 flex items-center justify-between">
          {/* Left Brand Logo & Desktop Navigation Links */}
          <div className="flex items-center space-x-2.5 sm:space-x-5">
            <Link href="/" className="flex items-center space-x-2 shrink-0 group py-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 border border-purple-400/30 group-hover:scale-105 transition duration-200">
                <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300 fill-amber-300" />
              </div>
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight font-sans">
                ReviewScript<span className="text-purple-400">.AI</span>
              </span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1.5 sm:space-x-2">
              <Link
                href="/"
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px] transition-all ${
                  isCurrent("/") || isCurrent("/dashboard")
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>สร้างสคริปต์</span>
              </Link>

              {user && (
                <Link
                  href="/history"
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px] transition-all ${
                    isCurrent("/history")
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>ประวัติ</span>
                </Link>
              )}
            </nav>
          </div>

          {/* User Profile & Actions / Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Desktop Profile Badge */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditNameModalOpen(true)}
                    title="คลิกเพื่อแก้ไขชื่อผู้ใช้งาน"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-200 font-medium min-h-[44px] transition group cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="max-w-[140px] truncate font-semibold text-xs">
                      {displayName}
                    </span>

                    {/* Premium Plan Badge */}
                    {planType === "admin" ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-sky-400 to-purple-500 text-slate-950 border border-white/40 font-black text-[10px] shadow-md shadow-purple-500/30">
                        <Crown className="w-3 h-3 text-slate-950 fill-slate-950 shrink-0" />
                        <span>ADM</span>
                      </span>
                    ) : planType === "pro" ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-500/25 text-amber-300 border border-amber-500/50 font-extrabold text-[10px] shadow-md shadow-amber-500/20 animate-pulse">
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <span>PRO</span>
                      </span>
                    ) : planType === "plus" ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-extrabold text-[10px]">
                        <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>PLUS</span>
                      </span>
                    ) : null}
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold min-h-[44px] transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>

                {/* Mobile / Compact Hamburger Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-purple-500/40 transition cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Menu className="w-5 h-5 text-slate-200" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-xl min-h-[44px] flex items-center justify-center transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 min-h-[44px] flex items-center justify-center transition"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Dropdown Hamburger Slide-over Menu */}
        {isMenuOpen && user && (
          <div className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* User Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm text-white truncate">
                      {displayName}
                    </span>
                    {planType === "admin" ? (
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-red-500 via-amber-400 to-purple-500 text-slate-950 font-black text-[9px]">
                        ADM
                      </span>
                    ) : planType === "pro" ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-[9px]">
                        PRO
                      </span>
                    ) : planType === "plus" ? (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-extrabold text-[9px]">
                        PLUS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-bold text-[9px]">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">บัญชีผู้ใช้งาน</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditNameModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer min-h-[44px]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>แก้ไขชื่อ</span>
              </button>
            </div>

            {/* Navigation Options List */}
            <div className="space-y-1.5">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl text-xs font-bold min-h-[44px] transition ${
                  isCurrent("/") || isCurrent("/dashboard")
                    ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Pencil className="w-4 h-4 text-purple-400" />
                <span>สร้างสคริปต์ใหม่</span>
              </Link>

              <Link
                href="/history"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl text-xs font-bold min-h-[44px] transition ${
                  isCurrent("/history")
                    ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <History className="w-4 h-4 text-purple-400" />
                <span>ประวัติสคริปต์ทั้งหมด</span>
              </Link>
            </div>

            {/* Account Sign Out Action */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold min-h-[44px] transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}
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
