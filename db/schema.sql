-- Posts (source of truth for the Next blog)
CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  date          TIMESTAMPTZ NOT NULL,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  categories    TEXT[] NOT NULL DEFAULT '{}',
  excerpt       TEXT,
  body          TEXT NOT NULL,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Existing DBs created before `published` / `featured` existed
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Date-only → datetime (keeps time when selecting hour/minute in admin)
ALTER TABLE posts
  ALTER COLUMN date TYPE TIMESTAMPTZ USING date::timestamp;

CREATE INDEX IF NOT EXISTS posts_date_idx ON posts (date DESC);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published);
CREATE INDEX IF NOT EXISTS posts_featured_idx ON posts (featured)
  WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS posts_categories_idx ON posts USING GIN (categories);

-- Editable site copy / options (admin Settings)
CREATE TABLE IF NOT EXISTS site_settings (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Managed categories for admin dropdown
CREATE TABLE IF NOT EXISTS categories (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  show_on_home    BOOLEAN NOT NULL DEFAULT FALSE,
  show_in_header  BOOLEAN NOT NULL DEFAULT FALSE,
  home_item_mode  TEXT NOT NULL DEFAULT 'title',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS show_in_header BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS home_item_mode TEXT NOT NULL DEFAULT 'title';

CREATE INDEX IF NOT EXISTS categories_show_on_home_idx ON categories (show_on_home)
  WHERE show_on_home = TRUE;

CREATE INDEX IF NOT EXISTS categories_show_in_header_idx ON categories (show_in_header)
  WHERE show_in_header = TRUE;

-- Managed tags (shown as #name — posts.tags stores bare names)
CREATE TABLE IF NOT EXISTS tags (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional projects listing
CREATE TABLE IF NOT EXISTS projects (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  date          DATE NOT NULL,
  description   TEXT NOT NULL,
  language      TEXT,
  website       TEXT,
  repo          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post comments (threaded)
CREATE TABLE IF NOT EXISTS comments (
  id            SERIAL PRIMARY KEY,
  post_slug     TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  parent_id     INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL,
  body          TEXT NOT NULL,
  likes_count   INTEGER NOT NULL DEFAULT 0,
  approved      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Existing DBs: keep prior comments visible. New inserts set approved explicitly.
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS comments_post_slug_idx ON comments (post_slug, created_at ASC);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments (parent_id);
CREATE INDEX IF NOT EXISTS comments_approved_idx ON comments (post_slug, approved);

-- One like per visitor per comment
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id    INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  visitor_id    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, visitor_id)
);
