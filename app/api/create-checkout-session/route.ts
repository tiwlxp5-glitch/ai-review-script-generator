import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน" },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    if (plan !== "plus" && plan !== "pro") {
      return NextResponse.json(
        { error: "ระบุแพ็กเกจไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email || "";
    const userId = session.user.id;

    const isPro = plan === "pro";
    const amount = isPro ? 19900 : 9900; // THB in Satang (99 THB or 199 THB)
    const planName = isPro
      ? "Pro Plan - AI Copywriter 20 เท่า"
      : "Plus Plan - AI Copywriter 10 เท่า";

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "promptpay"],
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `ReviewScript AI - ${planName}`,
              description: isPro
                ? "ปลดล็อกสคริปต์ระดับ Master Copywriter 20 เท่า + ตาราง B-Roll เฟรมต่อเฟรม + โหมดอ่านบท Teleprompter"
                : "ปลดล็อกสคริปต์ PAS Framework 10 เท่า + ตาราง B-Roll 4-6 ฉาก + 5 โทนการเล่าเรื่อง",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        plan: plan,
      },
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Failed to create Stripe Checkout session:", err);
    return NextResponse.json(
      { error: err?.message || "ไม่สามารถสร้างลิงก์ชำระเงินได้" },
      { status: 500 }
    );
  }
}
