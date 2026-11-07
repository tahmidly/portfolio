CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  cover_url text,
  cover_alt text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  author_id text,
  reading_time text,
  seo_title text,
  seo_description text,
  CONSTRAINT posts_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (status, published_at DESC);
--> statement-breakpoint
-- Old slugs keep working: /blogs/<old-slug> permanently redirects to the current slug.
CREATE TABLE IF NOT EXISTS post_slug_redirects (
  slug text PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
