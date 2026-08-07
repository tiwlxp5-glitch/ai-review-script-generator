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

    const userPlan = (profile?.plan_type || "free").toLowerCase();
    const isPro = userPlan === "pro" || (profile?.monthly_limit && profile.monthly_limit > 100);
    const isPlus = userPlan === "plus" || (profile?.monthly_limit && profile.monthly_limit > 7 && profile.monthly_limit <= 100);

    let planType: "admin" | "pro" | "plus" | "free" = "free";
    if (isAdmin) planType = "admin";
    else if (isPro) planType = "pro";
    else if (isPlus) planType = "plus";

    const defaultLimit = planType === "pro" ? 200 : planType === "plus" ? 100 : 7;
    const userLimit = planType === "free" ? 7 : (profile?.monthly_limit ?? defaultLimit);
    let usedCount = 0;

    if (!isAdmin) {
      // Count usage: 7 days for free tier, current calendar month for paid tiers
      const windowStartDate = new Date();
      if (planType === "free") {
        windowStartDate.setDate(windowStartDate.getDate() - 7);
      } else {
        windowStartDate.setDate(1);
        windowStartDate.setHours(0, 0, 0, 0);
      }

      const { count } = await supabase
        .from("script_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", windowStartDate.toISOString());

      usedCount = count || 0;

      if (usedCount >= userLimit) {
        const errorMsg =
          planType === "free"
            ? "คุณใช้สิทธิ์ทดลองฟรีครบ 7 ครั้งแล้ว! อัปเกรดเป็น Pro Plan เพียง 199.- เพื่อสร้างสคริปต์ไม่อั้น 200 ครั้ง/เดือน + ปลดล็อกตาราง B-Roll"
            : "คุณใช้สิทธิ์สร้างสคริปต์ครบตามโควตาในเดือนนี้แล้ว อัปเกรดเพื่อขยายสิทธิ์การใช้งาน";
        return NextResponse.json(
          {
            error: errorMsg,
            quotaExceeded: true,
            user_type: planType,
            limit: userLimit,
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      product_name,
      target_audience,
      product_link_or_extra,
      tone_style = "general",
      script_length = "medium",
    } = body;

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

    const lengthDesc =
      script_length === "short"
        ? "สั้นกระชับ (~15-30 วินาที / ประมาณ 60-90 คำ) เข้าประเด็นไว ปิดการขายด่วน"
        : script_length === "long"
        ? "ยาวเจาะลึก (~60-90+ วินาที / ประมาณ 220-350 คำ) รายละเอียดจัดเต็ม มีเรื่องเล่า สาธิตการใช้งาน และทลายข้อโต้แย้ง"
        : "ความยาวปกติ (~30-60 วินาที / ประมาณ 120-180 คำ) เล่าเรื่องและโชว์จุดเด่นอย่างสมดุล";

    // Dynamic Multi-Tier Prompt Architecture
    let prompt = "";

    if (planType === "pro" || planType === "admin") {
      // 🟣 PRO ENGINE: Master Copywriter (เก่งขึ้น 20 เท่า ค่าตัว 1,000+ บาท)
      prompt = `คุณคือ "Senior High-Conversion Master Copywriter & Creative Video Director" ค่าตัว 1,000+ บาทต่อสคริปต์ มีความเชี่ยวชาญระดับสูงสุดด้านจิตวิทยาการขายและไวรัลวิดีโอสั้น (TikTok Shop, Instagram Reels, YouTube Shorts)

โจทย์รีวิวสินค้า:
- สินค้า: <user_input>${product_name}</user_input>
- กลุ่มเป้าหมาย: <user_input>${audience}</user_input>${extraInfo ? `\n- รายละเอียดสินค้า/จุดขายเด่นพิเศษ: <user_input>${extraInfo}</user_input>` : ""}
- โทนอารมณ์ (Tone): ${selectedToneDescription}
- ความยาวที่ต้องการ: ${lengthDesc}

ข้อกำหนดระบบ Pro Master Level (เก่งขึ้น 20 เท่า):
1. **3 Hook Options (0-3 วินาทีแรก)**: เสนอ 3 ทางเลือก Hook ที่ตอนต้นสคริปต์ ให้ผู้ใช้เลือกใช้ตามสไตล์ (Visual Hook, Verbal Hook, Pain-Point Hook)
2. **Deep Psychological Storytelling**: ใช้จิตวิทยาโน้มน้าว อารมณ์ร่วมสูง ภาษาพูดธรรมชาติ 100% ไม่ประดิดประดอยหุ่นยนต์
3. **Objection Handling (ทลายข้อโต้แย้ง)**: ดักทางความลังเลในใจคนดู (เช่น กลัวแพง, กลัวแพ้, กลัวไม่คุ้ม) แล้วให้เหตุผลสนับสนุนที่หนักแน่น
4. **Psychological FOMO CTA**: ปิดการขายแบบลดความเสี่ยง (Risk Reversal) + เร่งด่วนให้รีบกดตะกร้าซ้ายล่าง
5. **Director's Cut B-Roll Table**: กำกับภาพอย่างละเอียด (มุมกล้อง, แสง, อารมณ์การแสดง, เสียงเอฟเฟกต์ SFX เช่น Whoosh, Pop, Ding) และข้อความซับกลางจอ

กรุณาส่งออกผลลัพธ์เป็น JSON ภาษาไทยที่ถูกต้อง 100%:
{
  "script": "[ตัวเลือก Hook 3 สไตล์: A/B/C]\\n\\n[เนื้อหาบทพูดพากย์เสียงฉบับเต็ม พร้อมระบุช่วงเวลา สื่ออารมณ์ธรรมชาติ และทลายข้อโต้แย้งในใจคนดู]",
  "shot_list": [
    {
      "time": "0-3s",
      "visual": "รายละเอียดภาพ/มุมกล้อง/แสง/การแสดงอารมณ์หน้าตา",
      "audio": "บทพูด + เสียงเอฟเฟกต์ (SFX)",
      "text_on_screen": "ตัวหนังสือตัวใหญ่สะดุดตาขึ้นกลางจอ"
    }
  ],
  "caption": "แคปชันเปิดหัวกระตุกอารมณ์ เล่าเรื่องชวนอ่าน มี Emoji ภาษาสวย น่ากดซื้อ",
  "hashtags": "แฮชแท็กติดเทรนด์ดันฟีด 6-8 อัน",
  "pinned_comment": "ข้อความพิมพ์ปักตะกร้าในคอมเมนต์เน้นกระตุ้นยอดขายด่วน"
}

กฎเหล็ก: ส่งออกเฉพาะ JSON ภาษาไทยเท่านั้น ห้ามมี markdown นอกเหนือจาก JSON ห้ามใส่คำพูดทางการแข็งๆ`;
    } else if (planType === "plus") {
      // 🔵 PLUS ENGINE: Experienced Copywriter (เก่งขึ้น 10 เท่า)
      prompt = `คุณคือ "Experienced Video Copywriter" ผู้เชี่ยวชาญการทำคอนเทนต์รีวิวสินค้าสร้างยอดขายระดับมืออาชีพ

โจทย์รีวิวสินค้า:
- สินค้า: <user_input>${product_name}</user_input>
- กลุ่มเป้าหมาย: <user_input>${audience}</user_input>${extraInfo ? `\n- รายละเอียดสินค้า/จุดขายเด่นพิเศษ: <user_input>${extraInfo}</user_input>` : ""}
- โทนอารมณ์ (Tone): ${selectedToneDescription}
- ความยาวที่ต้องการ: ${lengthDesc}

หลักการเขียนสคริปต์ระดับ Plus (เก่งขึ้น 10 เท่า):
1. **PAS Framework**: ใช้โครงสร้าง Problem (ชี้ปัญหา) -> Agitate (สะกิดแผล) -> Solution (เฉลยวิธีแก้ด้วยสินค้า)
2. **Spoken Thai 100%**: ใช้ภาษาพูดเป็นกันเอง เหมือนเพื่อนบอกต่อ ไม่เหมือนโฆษณาTV
3. **Visual B-Roll Shot-list**: จัดตารางถ่ายภาพ 4-6 ฉาก กำกับมุมกล้อง เสียงพูด และซับกลางจอ
4. **Call to Action**: ชี้ชวนไปที่ตะกร้าเหลืองมุมซ้ายล่างอย่างลื่นไหล

กรุณาส่งออกผลลัพธ์เป็น JSON ภาษาไทยที่ถูกต้อง 100%:
{
  "script": "บทพูดรีวิวภาษาไทยแบบสั้นกระชับ ลื่นไหล เป็นธรรมชาติ มีจังหวะหยุดพูด",
  "shot_list": [
    {
      "time": "0-3s",
      "visual": "ภาพและท่าทางที่ต้องถ่ายฉากนี้",
      "audio": "บทพูดเฉพาะฉากนี้",
      "text_on_screen": "ตัวหนังสือขึ้นกลางจอ"
    }
  ],
  "caption": "แคปชันรีวิวอ่านแล้วอยากซื้อ มี Emoji",
  "hashtags": "แฮชแท็กติดเทรนด์ 5-6 อัน",
  "pinned_comment": "ประโยคปักตะกร้าชวนกดซื้อ"
}

กฎเหล็ก: ส่งออกเฉพาะ JSON ภาษาไทยเท่านั้น`;
    } else {
      // 🟢 FREE ENGINE: Standard Natural Reviewer (เก่งขึ้น 3 เท่า)
      prompt = `คุณคือ "นักคิดสคริปต์รีวิวสินค้า TikTok" ที่เน้นภาษาพูดเป็นกันเอง เรียบง่าย และจริงใจ

โจทย์รีวิวสินค้า:
- สินค้า: <user_input>${product_name}</user_input>
- กลุ่มเป้าหมาย: <user_input>${audience}</user_input>${extraInfo ? `\n- รายละเอียดสินค้า/จุดขายเด่นพิเศษ: <user_input>${extraInfo}</user_input>` : ""}
- โทนอารมณ์ (Tone): ${selectedToneDescription}
- ความยาวที่ต้องการ: ${lengthDesc}

หลักการเขียนสคริปต์ระดับปกติ (เก่งขึ้น 3 เท่า):
1. เปิดด้วย Hook สะกิดใจ ห้ามทักทายสวัสดีทางการ
2. ใช้ภาษาพูดเรียบง่าย 100% สไตล์เพื่อนบอกของดี
3. เล่าประโยชน์หลักสินค้าสั้นๆ ชัดเจน
4. จบด้วยคำชวนกดสั่งซื้อที่ตะกร้าเหลืองซ้ายล่าง

กรุณาส่งออกผลลัพธ์เป็น JSON ภาษาไทยที่ถูกต้อง 100%:
{
  "script": "บทพูดรีวิวภาษาไทยที่เป็นกันเอง ลื่นไหล ฟังสบาย",
  "shot_list": [
    {
      "time": "0-3s",
      "visual": "ภาพผู้พูดและสินค้า",
      "audio": "บทพูดฉากแรก",
      "text_on_screen": "ซับสะดุดตา"
    }
  ],
  "caption": "แคปชันรีวิวสั้นๆ น่าอ่าน",
  "hashtags": "#รีวิวสินค้า #TikTokShopป้ายยา #ของดีบอกต่อ",
  "pinned_comment": "กดสั่งซื้อที่ตะกร้าเหลืองมุมซ้ายล่างได้เลยครับ!"
}

กฎเหล็ก: ส่งออกเฉพาะ JSON ภาษาไทยเท่านั้น`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-002",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash",
      "gemini-pro",
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
