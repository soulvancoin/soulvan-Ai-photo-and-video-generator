# CLIP Provenance Service

Flask service for CLIP-based originality scoring, provenance signing, and artifact storage.

## Features

- CLIP embedding generation for images
- Originality scoring against corpus
- PostgreSQL persistence for embeddings and job metadata
- S3 and IPFS storage integration
- Provenance signing with wallet keys

## Setup

```bash
pip install -r requirements.txt
```

## Database Setup

Create PostgreSQL database and load schema:

```bash
createdb soulvan
psql -U postgres -d soulvan -f schema.sql
```

## Environment Variables

```bash
# Database
export DB_NAME=soulvan
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432

# AWS S3
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
export S3_BUCKET=soulvan-artifacts

# IPFS (Pinata)
export PINATA_API_KEY=your_api_key
export PINATA_SECRET_KEY=your_secret
```

## Run

```bash
python server.py
```

Service listens on port 5200.

## Endpoints

### Generate Embedding

```bash
POST /embed
{
  "path": "/path/to/image.jpg",
  "artifact_id": "unique-id",  # optional, stores in DB
  "metadata": {"creator": "0xABC"}  # optional
}
```

### Audit Originality

```bash
POST /audit
{
  "path": "/path/to/image.jpg",
  "job_id": "uuid",  # optional, stores result
  "wallet": "0xABC",  # optional
  "scene": "scene_name",  # optional
  "format": "EXR"  # optional
}
```

Returns:
```json
{
  "originalityScore": 0.85,
  "matches": [
    {"id": "ref-001", "similarity": 0.15},
    {"id": "ref-002", "similarity": 0.12}
  ]
}
```

### Index Artifact

```bash
POST /index
{
  "path": "/path/to/reference.jpg",
  "id": "ref-001",
  "metadata": {"source": "official_render"}
}
```

### Sign Artifact

```bash
POST /sign
{
  "path": "/path/to/artifact.exr",
  "wallet_key": "0xYourKey",
  "job_id": "uuid"  # optional, updates DB
}
```

### Upload to Storage

```bash
POST /upload
{
  "path": "/path/to/artifact.usd",
  "storage": "dual",  # "s3", "ipfs", or "dual"
  "bucket": "my-bucket",  # for S3
  "key": "artifacts/scene.usd",  # for S3
  "metadata": {"creator": "0xABC"},  # for IPFS
  "job_id": "uuid"  # optional, updates output_url in DB
}
```

Returns:
```json
{
  "s3_uri": "s3://bucket/key",
  "ipfs_hash": "Qm...",
  "ipfs_url": "https://gateway.pinata.cloud/ipfs/Qm..."
}
```

## Example Workflow

```bash
# 1. Index reference images
curl -X POST http://localhost:5200/index \
  -H "Content-Type: application/json" \
  -d '{"path": "/refs/official_01.jpg", "id": "official-01"}'

# 2. Audit new render for originality
curl -X POST http://localhost:5200/audit \
  -H "Content-Type: application/json" \
  -d '{"path": "/renders/new_render.jpg", "job_id": "uuid-123"}'

# 3. Sign the artifact
curl -X POST http://localhost:5200/sign \
  -H "Content-Type: application/json" \
  -d '{"path": "/renders/new_render.exr", "wallet_key": "0xDEMO", "job_id": "uuid-123"}'

# 4. Upload to storage
curl -X POST http://localhost:5200/upload \
  -H "Content-Type: application/json" \
  -d '{"path": "/renders/new_render.exr", "storage": "dual", "job_id": "uuid-123"}'
```

## Database Schema

See `schema.sql` for complete schema. Key tables:

- `render_jobs` - Job metadata and status
- `clip_embeddings` - Stored CLIP vectors
- `dao_votes` - Community votes on jobs
- `music_styles` - Wallet style preferences

## Production Notes

- Replace demo wallet signing with KMS/HSM
- Use vector database (Milvus/Pinecone) for large-scale similarity search
- Add authentication (JWT) to all endpoints
- Enable CORS for web dashboard integration
- Set up connection pooling for PostgreSQL
- Add Prometheus metrics for monitoring
