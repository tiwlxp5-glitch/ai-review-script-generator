import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "edge";

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
      console.error("Stripe session retrieve error in verify-payment:", stripeErr);
      isVerified = false;
    }

    if (isVerified && (targetUserId || loggedInUserId)) {
      const limit = plan === "pro" ? 200 : 100;
      let updatedSuccessfully = false;
      const userIdsToUpdate = Array.from(
        new Set([targetUserId, loggedInUserId].filter((id): id is string => Boolean(id)))
      );

      for (const currentId of userIdsToUpdate) {
        // 1. Try updating using Authenticated User Session Client
        try {
          const userSupabase = await createClient();
          const { error: userUpdateErr, data: userUpdateData } = await userSupabase
            .from("profiles")
            .update({
              plan_type: plan,
              monthly_limit: limit,
            })
            .eq("id", currentId)
            .select("plan_type");

          if (!userUpdateErr && userUpdateData && userUpdateData.length > 0) {
            updatedSuccessfully = true;
          }
        } catch (e) {
          console.warn("User session client profile update attempt failed:", e);
        }

        // 2. Try Admin Service Role Client (If SUPABASE_SERVICE_ROLE_KEY is present)
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

        if (serviceRoleKey) {
          try {
            const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);
            const { error: adminUpdateErr, data: adminData } = await adminSupabase
              .from("profiles")
              .update({
                plan_type: plan,
                monthly_limit: limit,
              })
              .eq("id", currentId)
              .select("plan_type");

            if (!adminUpdateErr && adminData && adminData.length > 0) {
              updatedSuccessfully = true;
            }
          } catch (e) {
            console.warn("Service role profile update error:", e);
          }
        } else {
          console.warn("SUPABASE_SERVICE_ROLE_KEY is missing! Using fallback update methods.");
        }

        // 3. Call RPC upgrade_user_profile function (Security Definer)
        try {
          const supabaseKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
          const fallbackClient = createAdminClient(supabaseUrl, supabaseKey);
          const { error: rpcErr } = await fallbackClient.rpc("upgrade_user_profile", {
            target_user_id: currentId,
            new_plan: plan,
            new_limit: limit,
          });

          if (!rpcErr) {
            updatedSuccessfully = true;
          } else {
            console.warn("RPC upgrade_user_profile warning:", rpcErr);
          }
        } catch (rpcErr) {
          console.warn("RPC upgrade_user_profile call failed:", rpcErr);
        }

        // 4. Direct Upsert Fallback (Creates profile row if missing)
        if (!updatedSuccessfully) {
          try {
            const supabaseKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
            const fallbackClient = createAdminClient(supabaseUrl, supabaseKey);
            const { error: upsertErr, data: upsertData } = await fallbackClient
              .from("profiles")
              .upsert(
                {
                  id: currentId,
                  email: customerEmail || undefined,
                  plan_type: plan,
                  monthly_limit: limit,
                },
                { onConflict: "id" }
              )
              .select("plan_type");

            if (!upsertErr && upsertData && upsertData.length > 0) {
              updatedSuccessfully = true;
            }
          } catch (upsertErr) {
            console.error("Profile upsert error:", upsertErr);
          }
        }

        // 5. Double Check: Query profiles table to confirm plan_type was updated
        try {
          const supabaseKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
          const verifyClient = createAdminClient(supabaseUrl, supabaseKey);
          const { data: profileCheck } = await verifyClient
            .from("profiles")
            .select("plan_type")
            .eq("id", currentId)
            .maybeSingle();

          if (profileCheck?.plan_type === plan) {
            updatedSuccessfully = true;
          }
        } catch (checkErr) {
          console.warn("Profile plan verification check failed:", checkErr);
        }
      }

      if (updatedSuccessfully) {
        return NextResponse.json({
          success: true,
          plan,
          userId: targetUserId,
          message: `Successfully upgraded user ${targetUserId} to ${plan}`,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "ไม่สามารถอัปเดตสิทธิ์ในฐานข้อมูล Supabase ได้ กรุณาตรวจสอบ SUPABASE_SERVICE_ROLE_KEY",
          },
          { status: 500 }
        );
      }
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

