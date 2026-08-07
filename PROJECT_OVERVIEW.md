# 🚀 ReviewScript AI — Project Overview & Architecture Guide

เอกสารนี้จัดทำขึ้นเพื่อสรุปบริบท โครงสร้างระบบ และสถาปัตยกรรมทั้งหมดของโปรเจกต์ **ReviewScript AI** สำหรับนักพัฒนาและ AI Agent ที่เข้ามาดูแลโปรเจกต์ต่อในอนาคต

---

## 📌 1. ภาพรวมโปรเจกต์ (Project Overview)
**ReviewScript AI** คือเว็บแอปพลิเคชันสำหรับสร้างสคริปต์รีวิวสินค้าสไตล์ธรรมชาติสำหรับ TikTok Studio, Reels, และ Shorts ด้วย AI (Google Gemini API) พร้อมฟีเจอร์ช่วยถ่ายทำแบบมืออาชีพ ได้แก่:
* **บทพูดพากย์เสียง (Voiceover Script):** คำนวณความยาว ปรับโทนเล่าเรื่องตามสไตล์ผู้ใช้
* **ตารางถ่าย B-Roll (Visual Shot List):** กำหนดเวลากล้อง เทคนิคถ่ายทำ ภาพและเสียงเฟรมต่อเฟรม
* **แคปชัน & แฮชแท็ก (Caption & Hashtags):** สรุปข้อความปักตะกร้าและแฮชแท็กติดเทรนด์
* **โหมดอ่านบท (Teleprompter Mode):** แสดงตัวอักษรวิ่งขณะถ่ายคลิป

---

## 🛠️ 2. เทคโนโลยีและระบบหลังบ้าน (Tech Stack & Architecture)

| ส่วนประกอบ (Component) | เทคโนโลยีที่ใช้ (Technology Used) | รายละเอียด (Details) |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React, TypeScript | TailwindCSS, Lucide Icons, Glassmorphism UI |
| **Deployment & Hosting** | Vercel | Auto-deploy ผ่าน GitHub `main` branch แบบ Serverless |
| **Database & Auth** | Supabase (PostgreSQL) | Auth Engine, Row-Level Security (RLS), RPC Functions |
| **Payment Gateway** | Stripe (Checkout & Webhooks) | รองรับ PromptPay, บัตรเครดิต/เดบิต, และส่วนลด 100% |
| **AI Engine** | Google Gemini API (`@google/generative-ai`) | สร้างสคริปต์และจัดตารางฉาก |

---

## 💎 3. ระดับแพ็กเกจสมาชิกและโควตาการใช้งาน (Membership Plans)

| แพ็กเกจ (Plan) | โควตา (Quota) | รอบเวลา (Reset Cycle) | ฟีเจอร์ที่ได้รับ (Features) |
| :--- | :--- | :--- | :--- |
| **Free (ธรรมดา)** | 7 ครั้ง | ทุก 7 วัน (7-Day Rolling) | 2 โทนเสียงพื้นฐาน (เป็นกันเอง, ดราม่า) |
| **Plus (99.-)** | 100 ครั้ง | ทุกเดือน (Monthly) | 5 โทนเสียง + ตาราง B-Roll 4-6 ฉาก |
| **Pro (199.-)** | 200 ครั้ง | ทุกเดือน (Monthly) | 10 โทนระดับ Master Copywriter + ตาราง B-Roll เฟรมต่อเฟรม + โหมด Teleprompter |
| **Admin** | ไม่จำกัด (-1) | ไม่จำกัด | สิทธิ์สูงสุดสำหรับผู้ดูแลระบบ (`tiwlxp5@gmail.com`) |

---

## 📁 4. โครงสร้างไฟล์และระบบสำคัญ (Key File Structure)

```
ai-review-script-generator/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/  # สร้าง Stripe Checkout Session
│   │   ├── generate-script/          # เรียกใช้ Gemini AI สร้างสคริปต์ & ตาราง B-Roll
│   │   ├── user-profile/             # อ่าน/แก้ไขชื่อผู้ใช้และสิทธิ์สมาชิก
│   │   ├── user-usage/               # คำนวณโควตาคงเหลือของผู้ใช้แบบ Real-time
│   │   ├── verify-payment/           # ยืนยันสิทธิ์ชำระเงินเมื่อส่งกลับจาก Stripe
│   │   └── webhooks/stripe/          # รับ Event Webhook อัตโนมัติจาก Stripe
│   ├── dashboard/page.tsx            # หน้าหลักสร้างสคริปต์ UI & แบนเนอร์อัปเกรด
│   ├── history/page.tsx              # หน้าประวัติสคริปต์ที่เคยสร้าง
│   ├── login/                        # หน้าเข้าสู่ระบบ
│   └── signup/                       # หน้าสมัครสมาชิก
├── components/
│   ├── Navbar.tsx                    # แถบเมนูด้านบนพร้อมป้าย PRO / PLUS / ADM
│   ├── TeleprompterModal.tsx         # หน้าต่างตัวอักษรวิ่งอ่านบทขณะถ่าย
│   └── UpgradeProModal.tsx           # หน้าต่างเลือกแพ็กเกจชำระเงิน Stripe
├── lib/
│   ├── stripe.ts                     # Stripe Client Initialization
│   └── supabase/                     # Supabase Client & Server Initialization
└── supabase/
    └── schema.sql                    # SQL Script สำหรับตาราง, RLS, Triggers, RPC
```

---

## 🗄️ 5. โครงสร้างฐานข้อมูล Supabase (Database Schema)

### 5.1 ตาราง `public.profiles`
เก็บข้อมูลระดับสมาชิกและโควตาของผู้ใช้งาน (เชื่อมกับ `auth.users`)
* `id` (`UUID`, Primary Key -> `auth.users.id`)
* `email` (`TEXT`)
* `display_name` (`TEXT`)
* `plan_type` (`TEXT`: `'free'`, `'plus'`, `'pro'`, `'admin'`) *(หมายเหตุ: โค้ดรองรับแบบ Case-Insensitive ทั้ง `Pro`, `pro`, `Plus`, `plus`)*
* `monthly_limit` (`INTEGER`: `7` สำหรับ free, `100` สำหรับ plus, `200` สำหรับ pro, `-1` สำหรับ admin)

### 5.2 ตาราง `public.script_history`
เก็บประวัติการสร้างสคริปต์ของผู้ใช้
* `id` (`UUID`, Primary Key)
* `user_id` (`UUID` -> `profiles.id`)
* `product_name` (`TEXT`), `target_audience` (`TEXT`), `script_content` (`TEXT`)
* `shot_list` (`JSONB`), `caption` (`TEXT`), `hashtags` (`TEXT`), `pinned_comment` (`TEXT`)
* `created_at` (`TIMESTAMP WITH TIME ZONE`)

### 5.3 RPC Function: `upgrade_user_profile`
ฟังก์ชัน SQL แบบ `SECURITY DEFINER` สำหรับข้ามระบบ RLS เพื่ออัปเดตแพ็กเกจผู้ใช้เมื่อชำระเงินสำเร็จ:
```sql
CREATE OR REPLACE FUNCTION public.upgrade_user_profile(
    target_user_id UUID,
    new_plan TEXT,
    new_limit INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, plan_type, monthly_limit)
    VALUES (target_user_id, new_plan, new_limit)
    ON CONFLICT (id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        monthly_limit = EXCLUDED.monthly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔑 6. ตัวแปรสภาพแวดล้อม (Environment Variables Required)

ไฟล์ `.env.local` และ **Vercel Environment Variables** ต้องมีคีย์ดังนี้:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (สำคัญมาก! ใช้สำหรับ Backend เพื่อข้าม RLS เข้าไปอัปเดตสิทธิ์ผู้ใช้)

# Gemini AI API Key
GEMINI_API_KEY=AIzaSy...

# Stripe Payment Gateway
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ⚠️ 7. ข้อควรจำสำหรับ AI Agent / Developers ที่เข้ามาทำต่อ

1. **การตรวจสอบ `plan_type`:** ให้ใช้ `.toLowerCase()` เสมอ เช่น `(profile.plan_type || "free").toLowerCase() === "pro"` เพราะในฐานข้อมูลอาจมีข้อมูลเก่าที่บันทึกเป็นตัวพิมพ์ใหญ่ (`Pro`, `Plus`)
2. **การอัปเดตข้อมูลผู้ใช้จาก Backend:** ต้องใช้ `SUPABASE_SERVICE_ROLE_KEY` หรือเรียกใช้ RPC `upgrade_user_profile` เสมอ เพื่อป้องกันไม่ให้ถูก RLS ของ Supabase บล็อก
3. **การนับโควตาสายฟรี:** สายฟรีใช้วิธีคำนวณย้อนหลัง 7 วัน (`windowStartDate.setDate(now.getDate() - 7)`) ต่างจาก Plus/Pro ที่นับตามเดือนปฏิทิน
4. **Dynamic Routes ใน Next.js:** Route API ทั้งหมดใน `app/api/` ต้องกำหนด `export const dynamic = "force-dynamic";` เพื่อป้องกันปัญหาการทำ Static Prerender ผิดพลาดตอนรัน `npm run build`
