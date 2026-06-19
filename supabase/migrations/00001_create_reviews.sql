CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid(),
  product_id UUID,
  user_id UUID,
  rating INTEGER,
  comment TEXT,
  images TEXT[],
  video TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
