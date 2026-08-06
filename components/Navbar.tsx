"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  LayoutDashboard,
  History,
  LogOut,
  User,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const navLinks = [
    {
      name: "สร้างสคริปต์",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "ประวัติการสร้าง",
      href: "/history",
      icon: History,
    },
  ];

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "ผู้ใช้งาน";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo Removed */}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="h-8 w-32 bg-slate-800/50 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                {/* User Profile Badge */}
                <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="max-w-[120px] truncate text-slate-200 font-medium">
                    {displayName}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  title="ออกจากระบบ"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span>สมัครสมาชิก</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-400">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="truncate">{displayName}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-purple-600"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>สมัครสมาชิก</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
