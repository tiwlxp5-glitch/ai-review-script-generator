import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle checkout completion (paid or 100% off zero-payment)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.client_reference_id || session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (userId && (plan === "plus" || plan === "pro")) {
      const limit = plan === "pro" ? 200 : 100;

      // 1. Direct update
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          plan_type: plan,
          monthly_limit: limit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateErr) {
        console.error("Webhook profile update error:", updateErr);
      }

      // 2. Security definer RPC fallback
      try {
        await supabase.rpc("upgrade_user_profile", {
          target_user_id: userId,
          new_plan: plan,
          new_limit: limit,
        });
      } catch (rpcErr) {
        console.warn("Webhook RPC upgrade_user_profile warning:", rpcErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
