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

      const userPlan = profile?.plan_type || "free";
      const isPro = userPlan === "pro" || (profile?.monthly_limit && profile.monthly_limit > 100);
      const isPlus = userPlan === "plus" || (profile?.monthly_limit && profile.monthly_limit > 7 && profile.monthly_limit <= 100);

      let planType: "admin" | "pro" | "plus" | "free" = "free";
      if (isAdmin) planType = "admin";
      else if (isPro) planType = "pro";
      else if (isPlus) planType = "plus";

      const defaultLimit = planType === "pro" ? 200 : planType === "plus" ? 100 : 7;
      const userLimit = planType === "free" ? 7 : (profile?.monthly_limit ?? defaultLimit);

      // Count scripts generated in last 7 days for free tier or monthly for paid tiers
      const windowStartDate = new Date();
      if (planType === "free") {
        windowStartDate.setDate(windowStartDate.getDate() - 7);
      } else {
        windowStartDate.setDate(1);
        windowStartDate.setHours(0, 0, 0, 0);
      }

      const { count, error } = await supabase
        .from("script_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", windowStartDate.toISOString());

      if (error) {
        console.error("Failed to count scripts:", error);
      }

      const usedCount = count || 0;
      const remaining = Math.max(0, userLimit - usedCount);

      return NextResponse.json({
        user_type: planType,
        is_admin: isAdmin,
        limit: userLimit,
        used: usedCount,
        remaining,
        period: planType === "free" ? "weekly" : "monthly",
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
