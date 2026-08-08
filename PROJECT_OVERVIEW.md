# 🚀 ReviewScript AI — Project Overview & Architecture Guide

เอกสารนี้จัดทำขึ้นเพื่อสรุปบริบท โครงสร้างระบบ ฟีเจอร์ปัจจุบัน และสถาปัตยกรรมทั้งหมดของโปรเจกต์ **ReviewScript AI** สำหรับนักพัฒนา ผู้ดูแลระบบ และ AI Agent ที่เข้ามาดูแลโปรเจกต์ต่อในอนาคต

---

## 📌 1. ภาพรวมโปรเจกต์ (Project Overview)

**ReviewScript AI** คือเว็บแอปพลิเคชันสายป้ายยาและครีเอเตอร์สำหรับการสร้าง **สคริปต์รีวิวสินค้าและวางแผนกระบวนการผลิตวิดีโอสั้นแบบครบวงจร** บนแพลตฟอร์ม TikTok Studio, Instagram Reels, YouTube Shorts และ TikTok Shop ขับเคลื่อนด้วยพลังของ **Google Gemini AI** และระบบหลังบ้านที่ทำงานแบบ Real-time 

### ฟีเจอร์หลักของระบบ (Core Features)

1. **บทพูดพากย์เสียง (Voiceover Script & 3 Hook Options):**
   - สร้างบทพูดภาษาไทยธรรมชาติ 100% (ภาษาพูดเพื่อนบอกต่อ ไม่ท่องจำ ไม่ใช้ภาษาแปลโฆษณา)
   - เลือกระดับความยาวบทพูดได้: **สั้น** (~15-30s / 60-90 คำ), **ปกติ** (~30-60s / 120-180 คำ), **ยาว** (~60-90s+ / 220-350 คำ)
   - เลือก Tone of Voice ได้ถึง **10 สไตล์** (เช่น เป็นกันเอง, ดราม่าสะกิดแผล, ASMR, รู้ลึกผู้เชี่ยวชาญ, สายฮา, Hard Sale, Soft Sale, เตือนภัยอย่าหาทำ, Before & After, Emotional)
   - **3 Hook Options (0-3 วินาทีแรก):** ออกแบบคำเปิดหัว 3 ทางเลือกชัดเจน (Hook A: Visual/Action, Hook B: Verbal Pain-Point, Hook C: Shocking/Contrast) *(เฉพาะ Pro/Admin)*
   - **Objection Handling:** แทรกจิตวิทยาการขายทลายความลังเลในใจคนดู (เช่น กลัวแพง กลัวไม่ดีจริง) ด้วยโครงสร้าง PAS (Problem -> Agitate -> Solution)

2. **ผู้ช่วยวิเคราะห์สินค้า 360° (AI Product Analyzer):**
   - พิมพ์เพียงชื่อสินค้าสั้นๆ (เช่น "ครีมกันแดด", "หูฟังไร้สาย") AI จะถอดรหัสกลุ่มเป้าหมายเชิงลึก (Target Audience Insights), จุดขายเด่น (Key USPs), ไอเดีย Hook ไวรัล, คำแนะนำทลายข้อโต้แย้ง และ Market Insight
   - ปุ่ม **"ส่งข้อมูลเข้าฟอร์มหลัก"** เพื่อกรอกชื่อสินค้าและกลุ่มเป้าหมายในหน้าสร้างสคริปต์ได้ใน 1 คลิก

3. **ตารางถ่าย B-Roll (Director's Cut Shot List):**
   - ตารางจัดฉากสำหรับตากล้องและครีเอเตอร์ บอกช่วงเวลา (Time), ภาพและมุมกล้อง/แสง/การแสดงอารมณ์ (Visual), เสียงพูด/SFX เสียงเอฟเฟกต์ (Audio), และข้อความซับสะดุดตากลางจอ (Text on Screen)

4. **โหมดอ่านบทหน้ากล้อง (Teleprompter Mode):**
   - เครื่องอ่านตัวอักษรวิ่งแบบ Full-screen ปรับความเร็วการเลื่อน (1x-8x), ปรับขนาดฟอนต์ (24px-56px), พลิกกระจกเงา (Mirror Flip Mode), พร้อมระบบป้องกันหน้าจอดับอัตโนมัติ (**Screen Wake Lock API**) และทางลัดคีย์บอร์ด (Spacebar เล่น/หยุด)

5. **แคปชัน, แฮชแท็ก & ปักตะกร้า (Caption, Hashtags & Pinned Comment):**
   - สร้างแคปชันเล่าเรื่องมี Emoji, แฮชแท็กติดเทรนด์ 5-8 อัน, และข้อความปักตะกร้าสั่งซื้อในคอมเมนต์ พร้อมปุ่ม คัดลอกแบบ Bundle นำไปโพสต์ได้ทันที

6. **ระบบประวัติ & ตัวแก้ไขสคริปต์ (Script History & Custom Editor):**
   - บันทึกประวัติสคริปต์ย้อนหลังอัตโนมัติ ค้นหาได้ Real-time พร้อมโหมดสลับสคริปต์แก้ไขเอง (Custom Editor) หรือคืนค่าฉบับ AI

---

## 🛠️ 2. เทคโนโลยีและสถาปัตยกรรมหลังบ้าน (Tech Stack & Architecture)

| ส่วนประกอบ (Component) | เทคโนโลยีที่ใช้ (Technology Used) | รายละเอียดเชิงลึก (Implementation Details) |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript | TailwindCSS, Lucide Icons, Glassmorphism UI, Responsive Mobile & Desktop Layout |
| **Deployment & Hosting** | Vercel Serverless | Auto-deploy ผ่าน GitHub `main` branch แบบ Serverless Edge Function |
| **Database & Auth** | Supabase (PostgreSQL) | Auth Engine, `@supabase/ssr` Cookies Auth, Row-Level Security (RLS), Security Definer RPC, Triggers |
| **Payment Gateway** | Stripe Payment Gateway | Stripe Checkout (รองรับ PromptPay QR Code, Credit/Debit Cards, Promotion Codes) & Webhooks HMAC Verification |
| **AI Engine** | Google Gemini API (`@google/generative-ai`) | Multi-Model Dynamic Fallback: `gemini-flash-latest` ➔ `gemini-3.5-flash` ➔ `gemini-3.6-flash` ➔ `gemini-flash-lite-latest` |

---

## 💎 3. ระดับแพ็กเกจสมาชิกและโควตาการใช้งาน (Membership Plans & Quotas)

| แพ็กเกจ (Plan) | ราคา (Price) | โควตา (Quota) | รอบนับโควตา (Cycle) | ฟีเจอร์และสิทธิ์ที่ได้รับ (Included Features) |
| :--- | :--- | :--- | :--- | :--- |
| **Guest (ผู้เยี่ยมชม)** | - | 0 ครั้ง | - | สามารถทดลองใช้งานโหมดอ่านบท Teleprompter Demo และระบบวิเคราะห์สินค้าเบสิก |
| **Free (ธรรมดา)** | ฟรี | 7 ครั้ง | 7 วันย้อนหลัง (Rolling) | 2 โทนเสียงพื้นฐาน (เป็นกันเอง, ดราม่า) + บทพูดเรียบง่าย |
| **Plus** | 99 บาท/เดือน | 100 ครั้ง | รายเดือนปฏิทิน | 5 โทนเสียง + โครงสร้าง PAS Framework + ตาราง B-Roll 4-6 ฉาก |
| **Pro Master** | 199 บาท/เดือน | 200 ครั้ง | รายเดือนปฏิทิน | 10 โทนเสียง Master Copywriter + **3 Hook Options** + **Objection Handling** + **Director's Cut B-Roll & SFX** + **Teleprompter สคริปต์จริง** + **ชุดแคปชัน&แฮชแท็ก** |
| **Admin** | - | ไม่จำกัด (-1) | ไม่จำกัด | สิทธิ์สูงสุดสำหรับผู้ดูแลระบบ (`tiwlxp5@gmail.com`) ปลดล็อกทุกฟีเจอร์ |

---

## 📁 4. โครงสร้างไฟล์และระบบสำคัญ (Directory & File Structure)

```
ai-review-script-generator/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx            # หน้าเข้าสู่ระบบ (Supabase Auth)
│   │   └── signup/page.tsx           # หน้าสมัครสมาชิกใหม่
│   ├── api/
│   │   ├── analyze-product/          # [POST] ให้ AI วิเคราะห์กลุ่มเป้าหมาย & จุดขาย 360°
│   │   ├── create-checkout-session/  # [POST] สร้าง Stripe Checkout Session (PromptPay / Card)
│   │   ├── generate-script/          # [POST] เรียก Gemini AI สร้างสคริปต์, B-Roll, Hooks & Captions
│   │   ├── user-profile/             # [GET/PATCH] อ่านและอัปเดตชื่อผู้ใช้ (display_name)
│   │   ├── user-usage/               # [GET] คำนวณโควตาคงเหลือและสถานะแพ็กเกจแบบ Real-time
│   │   ├── verify-payment/           # [GET] ยืนยันสิทธิ์ชำระเงินเมื่อส่งกลับจาก Stripe
│   │   └── webhooks/stripe/          # [POST] รับ Webhook Event อัตโนมัติจาก Stripe HMAC
│   ├── dashboard/page.tsx            # หน้าหลักสร้างสคริปต์, เลือกโหมด, UI เกลาบท & ผลลัพธ์
│   ├── history/page.tsx              # หน้าประวัติสคริปต์ที่เคยสร้าง ค้นหา & อ่านบท Teleprompter
│   ├── layout.tsx                    # Root Layout พร้อม Navbar & Global Provider
│   ├── globals.css                   # Custom Glassmorphic Styles, Animations & Scrollbars
│   └── page.tsx                      # Entry Page (Render Dashboard)
├── components/
│   ├── AIBrainComparisonModal.tsx    # ตารางเปรียบเทียบสมอง AI (Free vs Plus vs Pro Master)
│   ├── AuthModal.tsx                 # Pop-up เข้าสู่ระบบ/สมัครสมาชิกเมื่อกดใช้งานแบบ Guest
│   ├── EditDisplayNameModal.tsx      # Pop-up แก้ไขชื่อผู้ใช้งาน (ตรวจสอบชื่อซ้ำ)
│   ├── Navbar.tsx                    # แถบเมนูด้านบน แสดงสถานะสมาชิก (PRO/PLUS/ADM/FREE) & เมนูมือถือ
│   ├── ProductAnalyzerModal.tsx      # Pop-up ผู้ช่วยวิเคราะห์สินค้าด้วย AI
│   ├── TeleprompterModal.tsx         # โหมดอ่านบทตัวหนังสือวิ่งหน้ากล้อง + Wake Lock API
│   └── UpgradeProModal.tsx           # Pop-up เลือกแพ็กเกจ ชำระเงินผ่าน Stripe
├── lib/
│   ├── stripe.ts                     # Stripe Client Initializer (`stripe`)
│   └── supabase/
│       ├── client.ts                 # Supabase Browser Client (`createBrowserClient`)
│       └── server.ts                 # Supabase Server Client (`createServerClient` via `@supabase/ssr`)
├── middleware.ts                     # Next.js Middleware ป้องกัน Route ที่ต้องใช้ Auth
├── supabase/
│   └── schema.sql                    # SQL Script สำหรับตาราง, RLS, Triggers, RPC & Indexes
└── PROJECT_OVERVIEW.md              # เอกสารสรุปบริบทและสถาปัตยกรรมของโปรเจกต์
```

---

## 🗄️ 5. โครงสร้างฐานข้อมูล Supabase และระบบความปลอดภัย (Database Schema & Security)

### 5.1 ตาราง `public.profiles`
เก็บข้อมูลระดับสมาชิกและโควตาของผู้ใช้งาน (เชื่อมกับ `auth.users` แบบ Cascade)
* `id` (`UUID`, Primary Key -> `auth.users.id`)
* `email` (`TEXT`)
* `display_name` (`TEXT`, Unique Check ใน API)
* `plan_type` (`TEXT`: `'free'`, `'plus'`, `'pro'`, `'admin'`)
* `monthly_limit` (`INTEGER`: `7` สำหรับ free, `100` สำหรับ plus, `200` สำหรับ pro, `-1` สำหรับ admin)
* `created_at`, `updated_at` (`TIMESTAMP WITH TIME ZONE`)

### 5.2 ตาราง `public.script_history`
เก็บประวัติการสร้างสคริปต์และข้อมูลการวางแผนถ่ายทำ
* `id` (`UUID`, Primary Key, `gen_random_uuid()`)
* `user_id` (`UUID` -> `profiles.id`)
* `product_name` (`TEXT`), `target_audience` (`TEXT`), `script_content` (`TEXT`)
* `shot_list` (`JSONB` -> โครงสร้างตาราง B-Roll: `time`, `visual`, `audio`, `text_on_screen`)
* `caption` (`TEXT`), `hashtags` (`TEXT`), `pinned_comment` (`TEXT`)
* `created_at` (`TIMESTAMP WITH TIME ZONE`)

### 5.3 Trigger อัตโนมัติเมื่อสมัครสมาชิก (`on_auth_user_created`)
เมื่อมีการสร้างผู้ใช้ใหม่ใน `auth.users` Trigger จะเรียกฟังก์ชัน `handle_new_user()` เพื่อสร้างแถวโปรไฟล์ใน `public.profiles` ทันที (พร้อมตั้งค่า Admin อัตโนมัติสำหรับ `tiwlxp5@gmail.com`):
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_plan TEXT := 'free';
  initial_limit INTEGER := 7;
BEGIN
  IF NEW.email = 'tiwlxp5@gmail.com' THEN
    initial_plan := 'admin';
    initial_limit := -1;
  END IF;

  INSERT INTO public.profiles (id, email, display_name, plan_type, monthly_limit)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    initial_plan,
    initial_limit
  )
  ON CONFLICT (id) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    monthly_limit = EXCLUDED.monthly_limit;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.4 RPC Function: `upgrade_user_profile` (Security Definer)
ฟังก์ชันข้าม RLS เพื่ออัปเดตสิทธิ์ชำระเงินอย่างปลอดภัย โดยให้สิทธิ์เฉพาะ `service_role` เท่านั้น:
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

REVOKE EXECUTE ON FUNCTION public.upgrade_user_profile(UUID, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upgrade_user_profile(UUID, TEXT, INTEGER) TO service_role;
```

### 5.5 Index ประสิทธิภาพการนับโควตา (`idx_script_history_user_created`)
```sql
CREATE INDEX IF NOT EXISTS idx_script_history_user_created ON public.script_history (user_id, created_at);
```

---

## 🔌 6. การเชื่อมต่อระบบหลังบ้านอย่างลึกซึ้ง (Deep Backend Integrations)

### 6.1 การประมวลผล Gemini AI & Multi-Model Resilience Layer
- **Prompt Engineering ตาม Tier:**
  - *Free:* สคริปต์สั้นกระชับ ภาษาพูดเพื่อนบอกต่อ
  - *Plus:* โครงสร้าง PAS (Problem-Agitate-Solution) + ตาราง B-Roll 4-6 ฉาก
  - *Pro:* 3 Hook Options (Visual, Verbal, Shocking) + Objection Handling + Director's Cut B-Roll & SFX + JSON Enforced Format
- **Multi-Model Fallback Engine:** ป้องกันปัญหาโมเดล Gemini ตัวใดตัวหนึ่งปิดปรับปรุงด้วยการลองเรียงตามลำดับ: `gemini-flash-latest` ➔ `gemini-3.5-flash` ➔ `gemini-3.6-flash` ➔ `gemini-flash-lite-latest`

### 6.2 กลไกยกระดับสิทธิ์ชำระเงินแบบ 5-Layer Fallback (Stripe & Supabase)
เมื่อผู้ใช้ชำระเงินสำเร็จผ่าน Stripe ระบบใช้กลไกยกระดับสิทธิ์ผู้ใช้ใน Supabase ถึง 5 ชั้น เพื่อให้มั่นใจ 100% ว่าผู้ใช้จะได้รับสิทธิ์โดยไม่มีปัญหาสิทธิ์ค้าง:
1. **Direct Authenticated Update:** อัปเดตผ่าน Session Client ของผู้ใช้ใน `verify-payment`
2. **Service Role Admin Client:** ข้าม RLS โดยตรงผ่าน `SUPABASE_SERVICE_ROLE_KEY`
3. **RPC Function Execution:** เรียกใช้ `upgrade_user_profile` ที่มีสิทธิ์ `SECURITY DEFINER`
4. **Direct Upsert Fallback:** ทำการ Upsert แถวใหม่หากยังไม่มีแถวโปรไฟล์ในตาราง
5. **Post-Update Verification Check:** Query อ่านตาราง `profiles` ซ้ำเพื่อยืนยันว่า `plan_type` อัปเดตสำเร็จแล้วจริงๆ ก่อนตอบกลับ Client

---

## 🔑 7. ตัวแปรสภาพแวดล้อม (Environment Variables Required)

ต้องระบุในไฟล์ `.env.local` และ **Vercel Environment Variables**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (สำคัญ! ใช้สำหรับ Backend ในการอัปเดตสิทธิ์ผู้ใช้ข้าม RLS)

# Gemini AI API Key
GEMINI_API_KEY=AIzaSy...

# Stripe Payment Gateway
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... / pk_live_...
STRIPE_SECRET_KEY=sk_test_... / sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ⚠️ 8. ข้อควรจำสำหรับนักพัฒนาและ AI Agent (Developer Guidelines)

1. **การตรวจสอบ `plan_type`:** ให้แปลงเป็นตัวพิมพ์เล็กเสมอ เช่น `(profile.plan_type || "free").toLowerCase() === "pro"` เพื่อป้องกันปัญหาตัวพิมพ์ใหญ่เล็กต่างกันในฐานข้อมูล
2. **การอัปเดตข้อมูลผู้ใช้จาก API Route:** ต้องใช้ `SUPABASE_SERVICE_ROLE_KEY` หรือเรียกใช้ RPC `upgrade_user_profile` เสมอ เพื่อป้องกันไม่ให้ RLS ของ Supabase บล็อก
3. **การคำนวณโควตาสายฟรี vs สายชำระเงิน:** 
   - สายฟรีใช้วิธีนับย้อนหลัง 7 วัน (`windowStartDate.setDate(now.getDate() - 7)`)
   - สมาชิก Plus/Pro นับตามเดือนปฏิทิน (`windowStartDate.setDate(1)`)
4. **Dynamic Routes ใน Next.js:** Route API ทั้งหมดใน `app/api/` ต้องใส่ `export const dynamic = "force-dynamic";` เพื่อป้องกันปัญหาการทำ Static Prerender ผิดพลาดระหว่าง `npm run build`

