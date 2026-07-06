-- SQL Migration Script to add is_new column to merchandise table
-- Run this script in your Supabase SQL Editor

ALTER TABLE merchandise ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
