import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tiwlxp5@gmail.com";

const TONE_PROMPTS: Record<string, string> = {
  general: "สไตล์เพื่อนเล่าให้เพื่อนฟัง เป็นกันเอง ภาษาพูดปกติ ไม่ประดิดประดอย",
  drama: "สไตล์เปิดด้วยดราม่า/ชวนตกใจ/ปัญหาที่แทงใจดำคนดู กระตุกอารมณ์ให้หยุดฟังตั้งแต่ 3 วินาทีแรก",
  asmr: "สไตล์ ASMR / Unboxing / เน้นโชว์เสียงแกะกล่อง สัมผัส ความฟิน และความน่าใช้ของสินค้า",
  expert: "สไตล์ผู้เชี่ยวชาญ / ให้ความรู้เชิงลึก น่าเชื่อถือ มีเหตุผลประกอบชัดเจน",
  funny: "สไตล์สายฮา / ตลก / เป็นกันเอง มีมุกเสี่ยวหรือจังหวะตลกให้คนดูอารมณ์ดี",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "กรุณาล็อกอินหรือสมัครสมาชิกก่อนใช้งานระบบสร้างสคริปต์" },
        { status: 401 }
      );
    }

    // Fetch user profile plan details
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, monthly_limit")
      .eq("id", user.id)
      .maybeSingle();

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

    const defaultLimit = planType === "pro" ? 200 : planType === "plus" ? 100 : 3;
    const userLimit = profile?.monthly_limit ?? defaultLimit;
    let usedCount = 0;

    if (!isAdmin) {
      // Count current month usage from database
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("script_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      usedCount = count || 0;

      if (usedCount >= userLimit) {
        return NextResponse.json(
          {
            error: "สิทธิ์การใช้งานในเดือนนี้ของคุณหมดแล้ว",
            quotaExceeded: true,
            user_type: planType,
            limit: userLimit,
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { product_name, target_audience, product_link_or_extra, tone_style = "general" } = body;

    if (!product_name || !product_name.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อสินค้าที่ต้องการรีวิว" },
        { status: 400 }
      );
    }

    const audience = target_audience?.trim() || "ทั่วไป / คนที่สนใจสินค้าชนิดนี้";
    const extraInfo = product_link_or_extra?.trim()
      ? `\nรายละเอียดเพิ่มเติม/จุดเด่น: ${product_link_or_extra.trim()}`
      : "";
    const selectedToneDescription = TONE_PROMPTS[tone_style] || TONE_PROMPTS.general;

    const prompt = `คุณคือครีเอทีฟผู้เชี่ยวชาญการเขียนสคริปต์ขายของคลิปสั้น TikTok Shop, Reels และ YouTube Shorts
สินค้า: ${product_name}
กลุ่มเป้าหมาย: ${audience}${extraInfo}
โทนการเล่าเรื่อง: ${selectedToneDescription}

กรุณาเขียนสคริปต์และจัดทำข้อมูลประกอบคอนเทนต์ให้ครบถ้วนในรูปแบบ JSON ดังนี้:
1. "script": บทพูดรีวิวสำหรับพากย์เสียงหรือพูดหน้ากล้อง ภาษาพูดแท้ๆ สั้นยาวสลับกัน มี Hook หยุดดู ปิดด้วยการชวนซื้อแบบไม่ยัดเยียด
2. "shot_list": ตารางลำดับการถ่ายทำ (Array ของ Object) แต่ละอันมี { "time": "วินาทีที่ (เช่น 0-3s)", "visual": "ภาพมุมกล้อง/ท่าทางที่ต้องถ่าย (B-Roll)", "audio": "บทพูดในฉากนั้น", "text_on_screen": "ตัวหนังสือขึ้นกลางจอ" }
3. "caption": แคปชันน่าสนใจสำหรับพิมพ์ลง TikTok/IG
4. "hashtags": แฮชแท็กติดเทรนด์ 5-8 อันที่เกี่ยวข้อง
5. "pinned_comment": ประโยคพิมพ์ปักตะกร้าชวนซื้อในช่องคอมเมนต์

กฎสำคัญ: ตอบกลับเป็น JSON ภาษาไทยที่ถูกต้องสมบูรณ์เท่านั้น ห้ามมีคำอธิบายอื่นแทรกนอกเหนือจากโครงสร้าง JSON`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let rawOutput = "";
    let generationError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawOutput = response.text();
        if (rawOutput) {
          break;
        }
      } catch (err) {
        // Fallback without responseMimeType if model doesn't support json mode directly
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          rawOutput = response.text();
          if (rawOutput) break;
        } catch (e2) {
          generationError = err;
        }
      }
    }

    if (!rawOutput) {
      console.error("Gemini script generation error:", generationError);
      const errMsg =
        generationError instanceof Error
          ? generationError.message
          : String(generationError);
      return NextResponse.json(
        { error: `ไม่สามารถสร้างสคริปต์ได้: ${errMsg}` },
        { status: 500 }
      );
    }

    // Clean JSON markdown if wrapped
    let cleanJsonStr = rawOutput.trim();
    if (cleanJsonStr.startsWith("```")) {
      cleanJsonStr = cleanJsonStr.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "").trim();
    }

    let parsedData: any = null;
    try {
      parsedData = JSON.parse(cleanJsonStr);
    } catch (parseErr) {
      console.warn("JSON parse fallback to text output:", parseErr);
      parsedData = {
        script: rawOutput,
        shot_list: [],
        caption: `รีวิว ${product_name} ดีจริงต้องลอง!`,
        hashtags: "#รีวิวสินค้า #TikTokShop #ของดีบอกต่อ",
        pinned_comment: "สนใจกดที่ตะกร้าเหลืองมุมซ้ายล่างได้เลยครับ!",
      };
    }

    const scriptText = parsedData.script || rawOutput;

    // Save script to history DB
    const { data: record, error: dbError } = await supabase
      .from("script_history")
      .insert({
        user_id: user.id,
        product_name,
        target_audience: audience,
        script_content: scriptText,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
    }

    return NextResponse.json({
      success: true,
      script: scriptText,
      shot_list: parsedData.shot_list || [],
      caption: parsedData.caption || "",
      hashtags: parsedData.hashtags || "",
      pinned_comment: parsedData.pinned_comment || "",
      tone_style,
      record,
      usage: {
        user_type: planType,
        used: usedCount + 1,
        limit: isAdmin ? -1 : userLimit,
        remaining: isAdmin ? "unlimited" : Math.max(0, userLimit - (usedCount + 1)),
      },
    });
  } catch (error: any) {
    console.error("Unhandled API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
