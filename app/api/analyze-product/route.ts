import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tiwlxp5@gmail.com";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "กรุณาล็อกอินก่อนใช้งานระบบวิเคราะห์สินค้า" },
        { status: 401 }
      );
    }

    // Fetch user profile plan details
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin =
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      profile?.plan_type === "admin";

    const userPlan = (profile?.plan_type || "free").toLowerCase();
    let planType: "admin" | "pro" | "plus" | "free" = "free";
    if (isAdmin) planType = "admin";
    else if (userPlan === "pro") planType = "pro";
    else if (userPlan === "plus") planType = "plus";

    const body = await request.json();
    const { product_input } = body;

    if (!product_input || !product_input.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อสินค้า หรือรายละเอียดสินค้าเพื่อทำการวิเคราะห์" },
        { status: 400 }
      );
    }

    const inputClean = product_input.trim();
    let prompt = "";

    if (planType === "pro" || planType === "admin") {
      // 🟣 PRO MASTER ANALYZER: 360° Ultimate Market & Viral Profiler
      prompt = `คุณคือ "Senior AI Market Researcher & High-Conversion Product Analyst"
โจทย์: วิเคราะห์เชิงลึก 360° สำหรับสินค้า: <user_input>${inputClean}</user_input>

ข้อกำหนดการวิเคราะห์ระดับ Pro Master (เก่งขึ้น 20 เท่า):
1. **refined_product_name**: ปรับชื่อสินค้าให้ฟังดูคมชัด น่าซื้อ กระตุกอารมณ์คนดู
2. **target_audience**: วิเคราะห์กลุ่มเป้าหมายเชิงลึก (ระบุอาชีพ, ช่วงอายุ, พฤติกรรม, ปัญหาจุกอก Pain Point ลึกๆ)
3. **key_usps**: ดึงจุดขายเด่นพิเศษ 3-5 ข้อที่เหนือกว่าคู่แข่ง
4. **viral_hooks**: เสนอ 3 ไอเดียคำเปิด Hook 0-3 วินาทีแรกที่เหมาะกับสินค้านี้
5. **objection_tips**: ดักทางข้อโต้แย้งในใจคนดู (เช่น แพงมั้ย? ดีจริงป่าว?) พร้อมคำตอบโต้แย้ง
6. **market_insight**: เคล็ดลับเพิ่มยอดขายสำหรับสินค้านี้บน TikTok Shop/Reels

ส่งออกผลลัพธ์เป็น JSON ภาษาไทยที่ถูกต้อง 100%:
{
  "refined_product_name": "ชื่อสินค้าที่ปรับให้คมชัด น่าซื้อ",
  "target_audience": "กลุ่มเป้าหมายเชิงลึก...",
  "key_usps": ["จุดขาย 1", "จุดขาย 2", "จุดขาย 3"],
  "viral_hooks": ["Hook 1", "Hook 2", "Hook 3"],
  "objection_tips": "คำแนะนำทลายข้อโต้แย้งในใจคนดู...",
  "market_insight": "ข้อมูลเชิงลึกการตลาด..."
}`;
    } else if (planType === "plus") {
      // 🔵 PLUS ANALYZER: Deep Target Profiler
      prompt = `คุณคือ "Experienced Product Analyst"
โจทย์: วิเคราะห์กลุ่มเป้าหมายและจุดขายสำหรับสินค้า: <user_input>${inputClean}</user_input>

ข้อกำหนดการวิเคราะห์ระดับ Plus (เก่งขึ้น 10 เท่า):
1. **refined_product_name**: ปรับชื่อสินค้าให้น่าสนใจยิ่งขึ้น
2. **target_audience**: กลุ่มเป้าหมายเฉพาะกลุ่มและปัญหาที่เขาพบ
3. **key_usps**: จุดขายเด่น 2-3 ข้อ

ส่งออกผลลัพธ์เป็น JSON ภาษาไทยที่ถูกต้อง 100%:
{
  "refined_product_name": "ชื่อสินค้าที่ปรับปรุงแล้ว",
  "target_audience": "กลุ่มเป้าหมายที่น่าจะซื้อ...",
  "key_usps": ["จุดขาย 1", "จุดขาย 2"],
  "viral_hooks": [],
  "objection_tips": "",
  "market_insight": ""
}`;
    } else {
      // 🟢 FREE ANALYZER: Basic Target Finder
      prompt = `คุณคือ "นักวิเคราะห์สินค้าเบสิก"
โจทย์: วิเคราะห์กลุ่มเป้าหมายพื้นฐานสำหรับสินค้า: <user_input>${inputClean}</user_input>

ส่งออกผลลัพธ์เป็น JSON ภาษาไทยที่ถูกต้อง 100%:
{
  "refined_product_name": "${inputClean}",
  "target_audience": "คนทั่วไปที่ต้องการแก้ปัญหาหรือสนใจสินค้านี้",
  "key_usps": ["จุดขายทั่วไป 1", "จุดขายทั่วไป 2"],
  "viral_hooks": [],
  "objection_tips": "",
  "market_insight": ""
}`;
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
      "gemini-flash-latest",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-flash-lite-latest",
    ];

    let rawOutput = "";
    let generationError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawOutput = response.text();
        if (rawOutput) break;
      } catch (err) {
        generationError = err;
      }
    }

    if (!rawOutput) {
      console.error("Product analysis error:", generationError);
      return NextResponse.json(
        { error: "ไม่สามารถวิเคราะห์สินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    let cleanJsonStr = rawOutput.trim();
    if (cleanJsonStr.startsWith("```")) {
      cleanJsonStr = cleanJsonStr
        .replace(/^```(json)?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
    }

    const parsedData = JSON.parse(cleanJsonStr);

    return NextResponse.json({
      success: true,
      analysis: parsedData,
      plan_type: planType,
    });
  } catch (error: any) {
    console.error("Analyze product route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
