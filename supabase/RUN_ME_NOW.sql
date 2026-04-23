-- ════════════════════════════════════════════════════════════════════
-- Bearstein Lab — v2 categories + color variants (combined, idempotent)
--
-- Copy this file into Supabase Dashboard → SQL Editor → Run.
-- Safe to re-run: every statement uses IF NOT EXISTS / ON CONFLICT /
-- WHERE IS NULL guards. After running, delete this file if you like.
-- ════════════════════════════════════════════════════════════════════

-- 1) Add the v2 category column + its active index. -------------------
ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS cat_v2 TEXT
    CHECK (cat_v2 IS NULL OR cat_v2 IN ('ears','eyes','ghost','hands','shoes'));

CREATE INDEX IF NOT EXISTS idx_parts_cat_v2_active
  ON public.parts(cat_v2, sort_order)
  WHERE is_active = true AND cat_v2 IS NOT NULL;

-- 2) Backfill existing v1 parts to a v2 slot. --------------------------
-- head → eyes (ears is intentionally empty so the admin can curate it)
UPDATE public.parts SET cat_v2 = 'eyes'  WHERE cat = 'head' AND cat_v2 IS NULL;
UPDATE public.parts SET cat_v2 = 'ghost' WHERE cat = 'body' AND cat_v2 IS NULL;
UPDATE public.parts SET cat_v2 = 'hands' WHERE cat = 'arm'  AND cat_v2 IS NULL;
UPDATE public.parts SET cat_v2 = 'shoes' WHERE cat = 'leg'  AND cat_v2 IS NULL;

-- 3) Color variants seed (48 parts). -----------------------------------
INSERT INTO public.parts (name, cat, cat_v2, url, uploaded_by, sort_order) VALUES
  ('Arm α (Rose)', 'arm', 'hands', '/images/parts/a0-rose.svg', 'seed-color', 10),
  ('Arm α (Mint)', 'arm', 'hands', '/images/parts/a0-mint.svg', 'seed-color', 11),
  ('Arm α (Sky)', 'arm', 'hands', '/images/parts/a0-sky.svg', 'seed-color', 12),
  ('Arm β (Rose)', 'arm', 'hands', '/images/parts/a1-rose.svg', 'seed-color', 13),
  ('Arm β (Mint)', 'arm', 'hands', '/images/parts/a1-mint.svg', 'seed-color', 14),
  ('Arm β (Sky)', 'arm', 'hands', '/images/parts/a1-sky.svg', 'seed-color', 15),
  ('Arm γ (Rose)', 'arm', 'hands', '/images/parts/a2-rose.svg', 'seed-color', 16),
  ('Arm γ (Mint)', 'arm', 'hands', '/images/parts/a2-mint.svg', 'seed-color', 17),
  ('Arm γ (Sky)', 'arm', 'hands', '/images/parts/a2-sky.svg', 'seed-color', 18),
  ('Arm δ (Rose)', 'arm', 'hands', '/images/parts/a3-rose.svg', 'seed-color', 19),
  ('Arm δ (Mint)', 'arm', 'hands', '/images/parts/a3-mint.svg', 'seed-color', 20),
  ('Arm δ (Sky)', 'arm', 'hands', '/images/parts/a3-sky.svg', 'seed-color', 21),
  ('Body α (Rose)', 'body', 'ghost', '/images/parts/b0-rose.svg', 'seed-color', 22),
  ('Body α (Mint)', 'body', 'ghost', '/images/parts/b0-mint.svg', 'seed-color', 23),
  ('Body α (Sky)', 'body', 'ghost', '/images/parts/b0-sky.svg', 'seed-color', 24),
  ('Body β (Rose)', 'body', 'ghost', '/images/parts/b1-rose.svg', 'seed-color', 25),
  ('Body β (Mint)', 'body', 'ghost', '/images/parts/b1-mint.svg', 'seed-color', 26),
  ('Body β (Sky)', 'body', 'ghost', '/images/parts/b1-sky.svg', 'seed-color', 27),
  ('Body γ (Rose)', 'body', 'ghost', '/images/parts/b2-rose.svg', 'seed-color', 28),
  ('Body γ (Mint)', 'body', 'ghost', '/images/parts/b2-mint.svg', 'seed-color', 29),
  ('Body γ (Sky)', 'body', 'ghost', '/images/parts/b2-sky.svg', 'seed-color', 30),
  ('Body δ (Rose)', 'body', 'ghost', '/images/parts/b3-rose.svg', 'seed-color', 31),
  ('Body δ (Mint)', 'body', 'ghost', '/images/parts/b3-mint.svg', 'seed-color', 32),
  ('Body δ (Sky)', 'body', 'ghost', '/images/parts/b3-sky.svg', 'seed-color', 33),
  ('Head α (Rose)', 'head', 'ears', '/images/parts/h0-rose.svg', 'seed-color', 34),
  ('Head α (Mint)', 'head', 'ears', '/images/parts/h0-mint.svg', 'seed-color', 35),
  ('Head α (Sky)', 'head', 'ears', '/images/parts/h0-sky.svg', 'seed-color', 36),
  ('Head β (Rose)', 'head', 'eyes', '/images/parts/h1-rose.svg', 'seed-color', 37),
  ('Head β (Mint)', 'head', 'eyes', '/images/parts/h1-mint.svg', 'seed-color', 38),
  ('Head β (Sky)', 'head', 'eyes', '/images/parts/h1-sky.svg', 'seed-color', 39),
  ('Head γ (Rose)', 'head', 'ears', '/images/parts/h2-rose.svg', 'seed-color', 40),
  ('Head γ (Mint)', 'head', 'ears', '/images/parts/h2-mint.svg', 'seed-color', 41),
  ('Head γ (Sky)', 'head', 'ears', '/images/parts/h2-sky.svg', 'seed-color', 42),
  ('Head δ (Rose)', 'head', 'eyes', '/images/parts/h3-rose.svg', 'seed-color', 43),
  ('Head δ (Mint)', 'head', 'eyes', '/images/parts/h3-mint.svg', 'seed-color', 44),
  ('Head δ (Sky)', 'head', 'eyes', '/images/parts/h3-sky.svg', 'seed-color', 45),
  ('Leg α (Rose)', 'leg', 'shoes', '/images/parts/l0-rose.svg', 'seed-color', 46),
  ('Leg α (Mint)', 'leg', 'shoes', '/images/parts/l0-mint.svg', 'seed-color', 47),
  ('Leg α (Sky)', 'leg', 'shoes', '/images/parts/l0-sky.svg', 'seed-color', 48),
  ('Leg β (Rose)', 'leg', 'shoes', '/images/parts/l1-rose.svg', 'seed-color', 49),
  ('Leg β (Mint)', 'leg', 'shoes', '/images/parts/l1-mint.svg', 'seed-color', 50),
  ('Leg β (Sky)', 'leg', 'shoes', '/images/parts/l1-sky.svg', 'seed-color', 51),
  ('Leg γ (Rose)', 'leg', 'shoes', '/images/parts/l2-rose.svg', 'seed-color', 52),
  ('Leg γ (Mint)', 'leg', 'shoes', '/images/parts/l2-mint.svg', 'seed-color', 53),
  ('Leg γ (Sky)', 'leg', 'shoes', '/images/parts/l2-sky.svg', 'seed-color', 54),
  ('Leg δ (Rose)', 'leg', 'shoes', '/images/parts/l3-rose.svg', 'seed-color', 55),
  ('Leg δ (Mint)', 'leg', 'shoes', '/images/parts/l3-mint.svg', 'seed-color', 56),
  ('Leg δ (Sky)', 'leg', 'shoes', '/images/parts/l3-sky.svg', 'seed-color', 57)
ON CONFLICT DO NOTHING;

-- 4) Sanity checks (optional — run after the inserts to verify). ------
-- SELECT cat_v2, COUNT(*) FROM public.parts WHERE is_active = true GROUP BY cat_v2;
-- expected rough result: ears 6, eyes 10, ghost 16, hands 16, shoes 16
