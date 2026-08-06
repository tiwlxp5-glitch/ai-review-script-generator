import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client with service role key if available, or standard client
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
      // Fallback for development testing
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle successful payment completion event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.client_reference_id || session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (userId && (plan === "plus" || plan === "pro")) {
      const limit = plan === "pro" ? 200 : 100;

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            plan_type: plan,
            monthly_limit: limit,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) {
        console.error(`Failed to upgrade user ${userId} to ${plan}:`, error);
      } else {
        console.log(`Successfully upgraded user ${userId} to ${plan}!`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
