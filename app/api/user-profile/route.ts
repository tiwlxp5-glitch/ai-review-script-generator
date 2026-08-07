import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabase = serviceRoleKey
      ? createAdminClient(supabaseUrl, serviceRoleKey)
      : userSupabase;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, plan_type, monthly_limit")
      .eq("id", user.id)
      .maybeSingle();

    const displayName =
      profile?.display_name ||
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "ผู้ใช้งาน";

    const ADMIN_EMAIL = "tiwlxp5@gmail.com";
    const isAdmin =
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      profile?.plan_type === "admin";

    const userPlan = profile?.plan_type || "free";
    const isPro = userPlan === "pro" || (profile?.monthly_limit && profile.monthly_limit > 100);
    const isPlus = userPlan === "plus" || (profile?.monthly_limit && profile.monthly_limit > 3 && profile.monthly_limit <= 100);

    let planType: "admin" | "pro" | "plus" | "free" = "free";
    if (isAdmin) planType = "admin";
    else if (isPro) planType = "pro";
    else if (isPlus) planType = "plus";

    return NextResponse.json({
      display_name: displayName,
      plan_type: planType,
      is_admin: isAdmin,
    });
  } catch (error: any) {
    console.error("User profile fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { display_name } = body;

    const trimmedName = display_name?.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
        { status: 400 }
      );
    }

    // Check if display_name is already taken by another user (case-insensitive)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .ilike("display_name", trimmedName)
      .neq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว กรุณาเลือกชื่ออื่น" },
        { status: 400 }
      );
    }

    // Update profiles table
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ display_name: trimmedName })
      .eq("id", user.id);

    if (updateProfileError) {
      console.error("Profile update error:", updateProfileError);
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการอัปเดตชื่อผู้ใช้" },
        { status: 500 }
      );
    }

    // Update Supabase auth user metadata
    await supabase.auth.updateUser({
      data: { display_name: trimmedName },
    });

    return NextResponse.json({
      success: true,
      display_name: trimmedName,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
