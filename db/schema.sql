-- ============================================================
-- currivo.mx — Supabase schema
-- Run these statements in the Supabase SQL Editor
-- ============================================================

-- Main CVs table (initial creation reference)
-- CREATE TABLE IF NOT EXISTS cvs (
--   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   slug        text UNIQUE NOT NULL,
--   nombre      text NOT NULL,
--   puesto      text NOT NULL,
--   ciudad      text,
--   email       text,
--   mercado     text NOT NULL DEFAULT 'mx',
--   cv_text     text NOT NULL,
--   form_data   jsonb,
--   created_at  timestamptz DEFAULT now()
-- );

-- ============================================================
-- MIGRATIONS
-- ============================================================

-- Add template column (run once in Supabase SQL Editor)
ALTER TABLE cvs
ADD COLUMN IF NOT EXISTS template text DEFAULT 'clasico';
