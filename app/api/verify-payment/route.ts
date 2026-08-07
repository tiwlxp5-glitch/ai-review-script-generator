import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

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

    // Retrieve checkout session directly from Stripe API
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required" ||
      session.status === "complete"
    ) {
      const plan = session.metadata?.plan || "plus";
      const limit = plan === "pro" ? 200 : 100;

      // Instant upgrade in Supabase profiles table
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          plan_type: plan,
          monthly_limit: limit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateErr) {
        console.error("Failed to update profile in verify-payment:", updateErr);
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
      }

      return NextResponse.json({
        success: true,
        plan,
        message: `Successfully upgraded user to ${plan}`,
      });
    }

    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (err: any) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
