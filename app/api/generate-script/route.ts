import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tiwlxp5@gmail.com";

const TONE_PROMPTS: Record<string, string> = {
  general: "สไตล์เพื่อนสนิทแนะของดี: ภาษาพูดเป็นกันเอง 100% เรียบง่าย จริงใจ ลื่นไหล ไม่สคริปต์ ไม่ท่องจำ",
  drama: "สไตล์เปิดด้วยดราม่า/ปัญหาจุกอก: ดึงอารมณ์ร่วม 3 วินาทีแรก ชี้จุดเจ็บ (Pain Point) ที่ทำให้อยากฟังต่อจนจบ",
  asmr: "สไตล์ ASMR & Sensory Review: เน้นการสัมผัส เสียงแกะกล่อง เนื้อสัมผัส (Texture) และความฟินขณะใช้งานจริง",
  expert: "สไตล์ผู้เชี่ยวชาญ/รู้จริง: ให้ความรู้เชิงลึกแบบย่อยง่าย มีข้อมูลอ้างอิงชัดเจน ดูน่าเชื่อถือและเป็นมืออาชีพ",
  funny: "สไตล์สายฮา/ตลกมีมุก: จังหวะเล่าตลก อารมณ์ดี มีมุกแซวตัวเองหรือสถานการณ์จริง คนดูยิ้มตาม",
  hardsale: "สไตล์ Hard Sale / นาทีทอง: กระตุ้นความอยากด่วน ชี้แจงโปรโมชัน ส่วนลด และคูปองจำนวนจำกัด ต้องรีบกด",
  softsale: "สไตล์แอบเนียนป้ายยา: เล่าเรื่องราวชีวิตประจำวัน (Vlog Style) แล้วสอดแทรกสินค้าเข้าบทพูดแบบเนียนๆ ไม่รู้สึกโดนขาย",
  warning: "สไตล์เตือนภัย / อย่าหาทำ (Myth Buster): เปิดด้วยคำเตือนกระตุกขวัญ ชี้ข้อผิดพลาดที่คนส่วนใหญ่เข้าใจผิด",
  beforeafter: "สไตล์โชว์ผลลัพธ์ Before & After: เปรียบเทียบความแตกต่างชัดเจนก่อนใช้กับหลังใช้ เห็นความเปลี่ยนแปลงตรงไปตรงมา",
  emotional: "สไตล์ซาบซึ้งประทับใจ (Emotional): ถ่ายทอดความรู้สึกอบอุ่น หัวใจพองโต การเปลี่ยนแปลงชีวิตทางดีขึ้นหลังมีสิ่งนี้",
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

    const audience = target_audience?.trim() || "คนทั่วไปที่ต้องการแก้ปัญหาหรือสนใจสินค้านี้";
    const extraInfo = product_link_or_extra?.trim()
      ? `\nรายละเอียดสินค้า/จุดขายเด่นพิเศษ: ${product_link_or_extra.trim()}`
      : "";
    const selectedToneDescription = TONE_PROMPTS[tone_style] || TONE_PROMPTS.general;

    // Advanced Copywriter Elite Prompt Construction
    const prompt = `คุณคือ "Senior High-Conversion Copywriter" ค่าตัวระดับ 500-1,000 บาทต่อสคริปต์ มีความเชี่ยวชาญระดับสูงสุดในการเขียนสคริปต์วิดีโอสั้น TikTok Shop, Instagram Reels และ YouTube Shorts ที่สร้างยอดขายจริง (High Conversion Video Copywriting)

โจทย์ของคุณคือเขียนสคริปต์รีวิวสินค้า:
- สินค้า: ${product_name}
- กลุ่มเป้าหมายคนดู: ${audience}${extraInfo}
- โทนอารมณ์การเล่าเรื่อง (Tone of Voice): ${selectedToneDescription}

หลักการเขียนสคริปต์ระดับ Copywriter มืออาชีพ (กรุณาปฏิบัติตามอย่างเคร่งครัด):
1. **Hook Rate (0-3 วินาทีแรก)**: ต้องสะกดคนดูให้หยุดไถทันที! ห้ามทักทายสวัสดีทางการ ห้ามเกริ่นอ้อมค้อม ให้ใช้เทคนิค Pattern Interrupt / คำถามสะกิดใจ / ชี้จุดเจ็บปวด (Pain Point)
2. **Body & Storytelling (3-15 วินาที)**: เล่าด้วยภาษาพูดธรรมชาติแท้ๆ (Spoken Thai) มีจังหวะจะโคน ใช้วจนภาษาเหมือนเพื่อนบอกต่อ ไม่เหมือนโฆษณาTV เน้นโชว์ประสบการณ์ตรง ความฟิน หรือผลลัพธ์หลังใช้จริง
3. **Call to Action & Urgency (15-20 วินาที)**: ปิดการขายแบบลื่นไหล ชี้ชวนไปที่ตะกร้าเหลืองมุมซ้ายล่าง สร้างความรู้สึกต้องกดสั่งตอนนี้ก่อนโปรหมด
4. **ตาราง Visual B-Roll (Shot-list)**: กำกับมุมกล้อง ท่าทางผู้แสดง และข้อความตัวหนังสือขึ้นกลางจอ (Subtitle Text Overlay) ให้ตรงกับจังหวะบทพูดแบบฉากต่อฉาก

กรุณาส่งออกผลลัพธ์เป็นโครงสร้าง JSON ภาษาไทยที่ถูกต้อง 100% ดังนี้:
{
  "script": "บทพูดรีวิวภาษาไทยแบบสั้นกระชับ ลื่นไหล เป็นธรรมชาติ มีจังหวะหยุดพูด เว้นวรรคสวยงาม",
  "shot_list": [
    {
      "time": "0-3s",
      "visual": "อธิบายภาพ/มุมกล้อง/ท่าทางหน้าตาที่ต้องถ่ายฉากนี้อย่างละเอียด",
      "audio": "บทพูดเฉพาะฉากนี้",
      "text_on_screen": "ตัวหนังสือตัวใหญ่สะดุดตาที่จะขึ้นกลางจอ"
    }
  ],
  "caption": "แคปชันรีวิวแบบอ่านแล้วอยากกดซื้อ มี Emoji ประกอบ น่าอ่าน ไม่สั้นไม่ยาวเกินไป",
  "hashtags": "แฮชแท็กติดเทรนด์ 5-8 อันที่เกื้อหนุนให้คลิปติดการค้นหา เช่น #ของดีบอกต่อ #TikTokShopป้ายยา",
  "pinned_comment": "ประโยคสั้นๆ พิมพ์ปักตะกร้าในคอมเมนต์ชวนกดซื้อ"
}

กฎเหล็ก: ห้ามมีคำอธิบายอื่นนอกเหนือจาก JSON ห้ามใส่ภาษาทางการประดิดประดอย ห้ามหุ่นยนต์`;

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
          generationConfig: {
            temperature: 0.85, // Higher creativity for high-converting copywriting
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawOutput = response.text();
        if (rawOutput) break;
      } catch (err) {
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
