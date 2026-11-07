-- Real pixel size of the cropped cover, so pages can reserve the exact
-- aspect ratio (no forced 16:9, no layout shift while it loads).
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_width integer CHECK (cover_width IS NULL OR cover_width BETWEEN 1 AND 20000);
--> statement-breakpoint
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_height integer CHECK (cover_height IS NULL OR cover_height BETWEEN 1 AND 20000);
