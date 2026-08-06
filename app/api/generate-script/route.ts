import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tiwlxp5@gmail.com";
const MEMBER_LIMIT = 3;

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

    const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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

      if (usedCount >= MEMBER_LIMIT) {
        return NextResponse.json(
          {
            error: `คุณใช้สิทธิ์สร้างสคริปต์ครบ ${MEMBER_LIMIT} ครั้งสำหรับเดือนนี้แล้ว สิทธิ์จะรีเซ็ตใหม่ในเดือนถัดไป`,
            quotaExceeded: true,
            user_type: "member",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { product_name, target_audience, product_link_or_extra } = body;

    if (!product_name || !product_name.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อสินค้าที่ต้องการรีวิว" },
        { status: 400 }
      );
    }

    const audience = target_audience?.trim() || "ทั่วไป / คนที่สนใจสินค้าชนิดนี้";
    const extraInfo = product_link_or_extra?.trim()
      ? `\nลิงก์สินค้า / รายละเอียดเพิ่มเติม: ${product_link_or_extra.trim()}`
      : "";

    const prompt = `คุณคือคนที่กำลังจะรีวิวสินค้าให้เพื่อนฟัง ไม่ใช่ AI และไม่ใช่นักการตลาด
สินค้า: ${product_name}
กลุ่มเป้าหมาย: ${audience}${extraInfo}

กฎการเขียนสคริปต์ (ต้องทำตามทุกข้อ):
- เขียนเหมือนภาษาพูดจริง มีจังหวะหยุด คำอุทาน และคำเชื่อมตามธรรมชาติ
- ประโยคไม่ต้องสมบูรณ์ทุกประโยค มีสั้นยาวปะปน
- ห้ามใช้สำนวนหรือคำที่ทำให้รู้ว่าเป็น AI หรือโฆษณา (เช่น "สินค้าคุณภาพเยี่ยม", "ต้องมีติดบ้าน")
- อย่าพยายามอวยทุกอย่าง ให้เล่าเหมือนความคิดเห็นจริง มีจุดที่เฉยๆ หรือติดบ้างถ้าเข้ากับธรรมชาติของการรีวิว
- เปิดด้วย Hook ที่ชวนหยุดดู แล้วค่อยเล่าความรู้สึก ชัดเจน และปิดท้ายด้วยการชวนแบบไม่ยัดเยียด
- ก่อนส่งคำตอบ ให้อ่านทวนในใจและแกล้งฟังเหมือนคนจริงพูดมากที่สุด

ตอบกลับเป็นสคริปต์ที่พร้อมใช้พูดได้เลย ไม่ต้องมีคำอธิบายอื่นแทรก`;

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

    let script_content = "";
    let generationError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        script_content = response.text();
        if (script_content) {
          break;
        }
      } catch (err) {
        generationError = err;
      }
    }

    if (!script_content) {
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

    // Save script to history DB
    const { data: record, error: dbError } = await supabase
      .from("script_history")
      .insert({
        user_id: user.id,
        product_name,
        target_audience: audience,
        script_content,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
    }

    return NextResponse.json({
      success: true,
      script: script_content,
      record,
      usage: {
        user_type: isAdmin ? "admin" : "member",
        used: usedCount + 1,
        limit: isAdmin ? -1 : MEMBER_LIMIT,
        remaining: isAdmin ? "unlimited" : Math.max(0, MEMBER_LIMIT - (usedCount + 1)),
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
