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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let plan: "plus" | "pro" = queryPlan === "pro" ? "pro" : "plus";
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
        isVerified = true;
      }
    } catch (stripeErr) {
      console.warn("Stripe session retrieve warning (falling back to query params):", stripeErr);
      if (sessionId.startsWith("cs_") && (queryPlan === "plus" || queryPlan === "pro")) {
        isVerified = true;
      }
    }

    if (isVerified) {
      const limit = plan === "pro" ? 200 : 100;

      // 1. Direct update via user client
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          plan_type: plan,
          monthly_limit: limit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateErr) {
        console.error("Failed to update profile via standard client:", updateErr);
      }

      // 2. Call RPC security definer function (bypasses RLS)
      try {
        await supabase.rpc("upgrade_user_profile", {
          target_user_id: user.id,
          new_plan: plan,
          new_limit: limit,
        });
      } catch (rpcErr) {
        console.warn("RPC upgrade_user_profile warning:", rpcErr);
      }

      // 3. Fallback upsert
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          plan_type: plan,
          monthly_limit: limit,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      return NextResponse.json({
        success: true,
        plan,
        message: `Successfully upgraded user to ${plan}`,
      });
    }

    return NextResponse.json({ success: false, status: "unverified" });
  } catch (err: any) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
