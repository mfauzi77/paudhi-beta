-- ============================================
-- PostgreSQL Schema untuk News Table
-- Migrasi dari MongoDB News model
-- ============================================

-- Drop table jika sudah ada (hati-hati di production!)
DROP TABLE IF EXISTS news CASCADE;

-- Create news table
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  
  -- Basic content
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image VARCHAR(500),
  
  -- Author dan approval (untuk sementara pakai string, nanti bisa jadi FK ke users table)
  author_id VARCHAR(100) NOT NULL,  -- MongoDB ObjectId dari User
  author_name VARCHAR(200),          -- Cached untuk query cepat
  author_kl VARCHAR(200),            -- Cached K/L name
  
  -- Status & approval
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'publish')),
  approved_by VARCHAR(100),          -- MongoDB ObjectId dari approver
  approved_at TIMESTAMP,
  published_at TIMESTAMP,
  news_date TIMESTAMP DEFAULT NOW(),
  
  -- K/L source
  source VARCHAR(200),               -- Auto-populated dari author.klName
  
  -- Category & meta
  category VARCHAR(100) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES untuk performance
-- ============================================

-- Index untuk filtering
CREATE INDEX idx_news_status ON news(status, is_active);
CREATE INDEX idx_news_author ON news(author_id, status);
CREATE INDEX idx_news_published ON news(published_at DESC) WHERE status = 'publish';

-- Index untuk search
CREATE INDEX idx_news_title ON news USING gin(to_tsvector('indonesian', title));
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_source ON news(source);

-- Index untuk sorting
CREATE INDEX idx_news_created_desc ON news(created_at DESC);

-- ============================================
-- Trigger untuk auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at 
BEFORE UPDATE ON news 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample data untuk testing (opsional)
-- ============================================

INSERT INTO news (title, content, excerpt, author_id, author_name, status, category, source) VALUES
('Berita Test 1', 'Ini adalah konten test berita pertama dari PostgreSQL', 'Excerpt test 1', 'test_user_1', 'Admin Test', 'publish', 'general', 'KEMENKO_PMK'),
('Berita Test 2', 'Ini adalah konten test berita kedua dari PostgreSQL', 'Excerpt test 2', 'test_user_2', 'Admin Test 2', 'draft', 'announcement', 'BPS');

-- Verify
SELECT id, title, status, author_name, created_at FROM news ORDER BY created_at DESC;
