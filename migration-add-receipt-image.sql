-- Migration to add receipt_image column to expenses table
-- Run this in your Supabase SQL Editor if your database is already created

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_image TEXT;
