-- Soulvan Database Schema

-- Job metadata and provenance tracking
CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID PRIMARY KEY,
  creator_wallet TEXT NOT NULL,
  scene TEXT NOT NULL,
  output_url TEXT,
  format TEXT CHECK (format IN ('USD', 'EXR', 'MP4')),
  originality_score FLOAT CHECK (originality_score >= 0 AND originality_score <= 1),
  signed_hash TEXT,
  signature TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- CLIP embeddings for originality detection
CREATE TABLE IF NOT EXISTS clip_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id TEXT NOT NULL UNIQUE,
  embedding FLOAT[] NOT NULL,
  metadata JSONB,
  indexed_at TIMESTAMP DEFAULT NOW()
);

-- DAO voting records
CREATE TABLE IF NOT EXISTS dao_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES render_jobs(id),
  voter_wallet TEXT NOT NULL,
  vote TEXT CHECK (vote IN ('approve', 'reject')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Music style preferences
CREATE TABLE IF NOT EXISTS music_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  truck_style TEXT,
  music_genre TEXT,
  mood TEXT DEFAULT 'cinematic',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_wallet ON render_jobs(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON render_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_job ON dao_votes(job_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_artifact ON clip_embeddings(artifact_id);
