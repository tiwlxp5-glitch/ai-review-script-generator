-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    plan_type TEXT DEFAULT 'free',
    monthly_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_limit INTEGER DEFAULT 3;

-- Automatically set admin plan for tiwlxp5@gmail.com
UPDATE public.profiles 
SET plan_type = 'admin', monthly_limit = -1 
WHERE email = 'tiwlxp5@gmail.com';

-- 2. Create Script History Table
CREATE TABLE IF NOT EXISTS public.script_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    script_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Profiles
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 5. RLS Policies for Script History
CREATE POLICY "Users can view own script history" 
    ON public.script_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own script history" 
    ON public.script_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own script history" 
    ON public.script_history FOR DELETE 
    USING (auth.uid() = user_id);

-- 6. Trigger to Automatically Create Profile on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_plan TEXT := 'free';
  initial_limit INTEGER := 3;
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

-- Drop trigger if exists to prevent errors on rerun
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
