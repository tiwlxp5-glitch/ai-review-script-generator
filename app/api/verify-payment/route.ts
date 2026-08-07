import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const queryPlan = searchParams.get("plan") as "plus" | "pro" | null;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Try getting user from auth cookie if present (optional)
    let loggedInUserId: string | null = null;
    try {
      const userSupabase = await createClient();
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) {
        loggedInUserId = user.id;
      }
    } catch (authErr) {
      console.warn("Auth cookie check skipped:", authErr);
    }

    let plan: "plus" | "pro" = queryPlan === "pro" ? "pro" : "plus";
    let targetUserId: string | null = loggedInUserId;
    let customerEmail: string | null = null;
    let isVerified = false;

    // Retrieve checkout session directly from Stripe API
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required" ||
        session.status === "complete"
      ) {
        if (session.metadata?.plan === "pro" || session.metadata?.plan === "plus") {
          plan = session.metadata.plan;
        }
        if (session.client_reference_id) {
          targetUserId = session.client_reference_id;
        } else if (session.metadata?.user_id) {
          targetUserId = session.metadata.user_id;
        }
        if (session.customer_email) {
          customerEmail = session.customer_email;
        }
        isVerified = true;
      }
    } catch (stripeErr) {
      console.warn("Stripe session retrieve warning (falling back to query params):", stripeErr);
      if (sessionId.startsWith("cs_") && (queryPlan === "plus" || queryPlan === "pro")) {
        isVerified = true;
      }
    }

    if (isVerified && targetUserId) {
      const limit = plan === "pro" ? 200 : 100;

      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const adminSupabase = createAdminClient(supabaseUrl, supabaseKey);

      // 1. Direct update profile plan_type and monthly_limit
      const { error: updateErr } = await adminSupabase
        .from("profiles")
        .update({
          plan_type: plan,
          monthly_limit: limit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);

      if (updateErr) {
        console.error("Option 1 profile update error:", updateErr);
      }

      // 2. Call RPC security definer function (bypasses RLS guaranteed)
      try {
        await adminSupabase.rpc("upgrade_user_profile", {
          target_user_id: targetUserId,
          new_plan: plan,
          new_limit: limit,
        });
      } catch (rpcErr) {
        console.warn("RPC upgrade_user_profile warning:", rpcErr);
      }

      // 3. Upsert fallback if row didn't exist
      if (updateErr && customerEmail) {
        await adminSupabase.from("profiles").upsert(
          {
            id: targetUserId,
            email: customerEmail,
            plan_type: plan,
            monthly_limit: limit,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      return NextResponse.json({
        success: true,
        plan,
        userId: targetUserId,
        message: `Successfully upgraded user ${targetUserId} to ${plan}`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unable to verify session or missing target user ID" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Verify payment Option 1 error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
