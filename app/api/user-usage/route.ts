import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tiwlxp5@gmail.com";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Fetch user profile plan details
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_type, monthly_limit")
        .eq("id", user.id)
        .maybeSingle();

      const isAdmin =
        user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
        profile?.plan_type === "admin";

      if (isAdmin) {
        return NextResponse.json({
          user_type: "admin",
          is_admin: true,
          limit: -1,
          used: 0,
          remaining: "unlimited",
        });
      }

      const planType = profile?.plan_type === "pro" ? "pro" : "free";
      const userLimit = profile?.monthly_limit ?? (planType === "pro" ? 200 : 3);

      // Count scripts generated in current calendar month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("script_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      if (error) {
        console.error("Failed to count monthly scripts:", error);
      }

      const usedCount = count || 0;
      const remaining = Math.max(0, userLimit - usedCount);

      return NextResponse.json({
        user_type: planType,
        is_admin: false,
        limit: userLimit,
        used: usedCount,
        remaining,
      });
    }

    return NextResponse.json({
      user_type: "guest",
      is_admin: false,
      limit: 0,
      used: 0,
      remaining: 0,
    });
  } catch (error: any) {
    console.error("Usage check error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
