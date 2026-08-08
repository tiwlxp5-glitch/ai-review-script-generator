import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const runtime = "edge";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured!");
    return NextResponse.json(
      { error: "Webhook secret is missing from environment variables." },
      { status: 500 }
    );
  }

  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: import("stripe").Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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
    const customerEmail = session.customer_email || session.customer_details?.email;

    if (userId && (plan === "plus" || plan === "pro")) {
      const limit = plan === "pro" ? 200 : 100;
      let updated = false;

      // 1. Direct update profile
      const { error: updateErr, data: updateData } = await supabase
        .from("profiles")
        .update({
          plan_type: plan,
          monthly_limit: limit,
        })
        .eq("id", userId)
        .select("plan_type");

      if (!updateErr && updateData && updateData.length > 0) {
        updated = true;
      } else if (updateErr) {
        console.error("Webhook profile update error:", updateErr);
      }

      // 2. Call RPC upgrade_user_profile function (Security Definer)
      try {
        const { error: rpcErr } = await supabase.rpc("upgrade_user_profile", {
          target_user_id: userId,
          new_plan: plan,
          new_limit: limit,
        });

        if (!rpcErr) {
          updated = true;
        } else {
          console.warn("Webhook RPC upgrade_user_profile warning:", rpcErr);
        }
      } catch (rpcErr) {
        console.warn("Webhook RPC upgrade_user_profile call failed:", rpcErr);
      }

      // 3. Upsert fallback if row didn't exist or wasn't updated
      if (!updated) {
        try {
          const { error: upsertErr, data: upsertData } = await supabase.from("profiles").upsert(
            {
              id: userId,
              email: customerEmail || undefined,
              plan_type: plan,
              monthly_limit: limit,
            },
            { onConflict: "id" }
          ).select("plan_type");

          if (!upsertErr && upsertData && upsertData.length > 0) {
            updated = true;
          }
        } catch (uErr) {
          console.error("Webhook profile upsert error:", uErr);
        }
      }

      console.log(`Stripe Webhook processed checkout.session.completed for user ${userId} -> plan: ${plan}, updated: ${updated}`);
    }
  }

  return NextResponse.json({ received: true });
}

