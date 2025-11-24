-- SQL FIX SCRIPT for Expense Application with Receipt Photos
-- This script fixes Row-Level Security policies for both Storage and Database

-- =================================================================
-- 1. STORAGE POLICY: Fixes the "violates row-level security policy"
--    error during IMAGE UPLOAD (supabase.storage.upload).
-- =================================================================

-- 1.1. Allow all authenticated users to upload (INSERT) into the 'expense-receipts' bucket.
CREATE POLICY "Allow authenticated users to upload receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'expense-receipts'::text);

-- 1.2. Allow all authenticated users to view (SELECT) files in the 'expense-receipts' bucket.
CREATE POLICY "Allow authenticated users to view receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'expense-receipts'::text);

-- =================================================================
-- 2. DATABASE RLS POLICY: Ensures authenticated users can
--    INSERT/UPDATE/DELETE rows in the 'expenses' table
--    (Crucial for the expense record itself).
-- =================================================================

-- NOTE: Ensure Row-Level Security (RLS) is enabled for the 'expenses' table first
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 2.1. Policy to allow authenticated users to CREATE (INSERT) expenses
CREATE POLICY "User can insert their own expenses"
ON public.expenses FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2.2. Policy to allow authenticated users to READ (SELECT) only their own expenses
CREATE POLICY "User can select their own expenses"
ON public.expenses FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2.3. Policy to allow authenticated users to UPDATE only their own expenses
CREATE POLICY "User can update their own expenses"
ON public.expenses FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2.4. Policy to allow authenticated users to DELETE only their own expenses
CREATE POLICY "User can delete their own expenses"
ON public.expenses FOR DELETE TO authenticated
USING (auth.uid() = user_id);
