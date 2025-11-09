# Soulvan Services Architecture

## Overview

The Soulvan AI Photo & Video platform consists of multiple microservices for job processing, provenance tracking, originality detection, DAO voting, wallet management, and blockchain integration.

## Service Catalog

### 1. CLIP Provenance Service (Port 5200)

**Location:** `services/clip-provenance/`

**Purpose:** CLIP-based originality scoring, provenance signing, and artifact storage

**Key Features:**
- CLIP embedding generation for visual similarity
- Originality scoring against known corpus
- PostgreSQL persistence for embeddings
- S3 and IPFS artifact uploads
- Provenance signing with wallet keys

**Endpoints:**
- `POST /embed` - Generate CLIP embedding
- `POST /audit` - Check originality score
- `POST /index` - Add to known corpus
- `POST /sign` - Sign artifact with wallet
- `POST /upload` - Upload to S3/IPFS

**Dependencies:**
- PostgreSQL database
- AWS S3 (optional)
- Pinata IPFS (optional)
- CLIP model (openai/clip-vit-base-patch32)

### 2. DAO Voting Service (Port 5300)

**Location:** `services/dao-voting/`

**Purpose:** Community voting, job submission, and music style mapping

**Key Features:**
- RESTful job submission API
- DAO voting with tally tracking
- Music genre mapping from truck styles
- Job status tracking
- Vote history and analytics

**Endpoints:**
- `POST /api/jobs` - Submit render job
- `GET /api/jobs/{id}` - Get job status
- `POST /api/vote` - Submit vote
- `GET /api/vote/{id}` - Get votes and tally
- `POST /api/music/style` - Map style to music genre
- `GET /health` - Health check

**Dependencies:**
- Shared PostgreSQL database
- Optional: SoulvanCoin contract for token-gating

### 3. Wallet Creator Service ⭐ **NEW**

**Location:** `services/wallet-creator/`

**Purpose:** Onboarding contributors with Ethereum wallet generation

**Key Features:**
- Generate Ethereum wallets using eth-account
- Interactive truck style selector
- Music genre hints for each style
- Profile JSON export with wallet details
- Security warnings and best practices

**Usage:**
```bash
python create_contributor_profile.py
```

**Output:** `contributors/{wallet_address}.json` with:
- Ethereum address
- Private key (encrypted in production)
- Selected truck style
- Timestamp

**Dependencies:**
- eth-account>=0.9.0

**Integration Points:**
- CLI `link-wallet` command
- DAO voting (requires SoulvanCoin)
- Music style preferences in database

### 4. Smart Contract Layer ⭐ **NEW**

**Location:** `contracts/`

**Purpose:** On-chain DAO voting for render job upgrades

**Key Features:**
- ERC20 token-gated voting (SoulvanCoin required)
- One vote per wallet per job
- Majority approval mechanism
- Vote reason strings for transparency
- Event emissions for off-chain indexing

**Main Contract:** `SoulvanUpgradeVoting.sol`

**Key Functions:**
- `createProposal(bytes32 jobId)` - Create upgrade proposal
- `voteOnUpgrade(bytes32 jobId, bool approve, string memory reason)` - Cast vote
- `applyUpgrade(bytes32 jobId)` - Execute if approved
- `getTally(bytes32 jobId)` - Query vote counts

**Events:**
- `VoteCast` - Indexed vote recording
- `ProposalCreated` - New job proposal
- `UpgradeApplied` - Upgrade approved and applied
- `UpgradeRejected` - Upgrade rejected by DAO

**Deployment:**
- Requires SoulvanCoin ERC20 contract address
- Deploy to Ethereum mainnet/L2 or testnet
- Use Foundry or Hardhat for compilation

**Integration:**
- Off-chain DAO voting service syncs to chain
- Event listeners trigger render service upgrades
- PostgreSQL stores chain state for quick queries

### 5. Dashboard UI Components

**Location:** `services/dashboard/`

**Purpose:** React components for contributor interface

**Components:**
1. `JobSubmissionForm` - Submit render jobs with wallet
2. `JobStatusViewer` - Real-time job status polling
3. `DAOVoting` - Vote on jobs with tally visualization
4. `MusicStyleSelector` - Map truck style to music genre
5. `MusicPreview` ⭐ **NEW** - Audio player for generated tracks
6. `LoadMusic` ⭐ **NEW** - Fetch and preview music by wallet + style

**Usage:**
```jsx
import { LoadMusic } from './components';

<LoadMusic 
  wallet="0x742d35Cc..." 
  truckStyle="graffiti"
  apiUrl="http://localhost:5300"
/>
```

**Dependencies:**
- React with hooks (useState, useEffect)
- Backend APIs: CLIP service, DAO voting service

### 6. NVIDIA AI Engine Service ⭐ **NEW - BEST IN CLASS**

**Location:** `services/nvidia-ai-engine/`

**Port:** 5400

**Purpose:** World-class photorealistic rendering and AI generation with latest NVIDIA technologies

**Key Features:**
- **RTX Rendering**: Global Illumination, DLSS 3.5 Ray Reconstruction, Neural Radiance Cache
- **AI Image Generation**: NVIDIA Picasso API (Stable Diffusion XL optimized)
- **3D Model Synthesis**: NVIDIA Edify for text/image-to-3D
- **Smart Auto-Updater**: 24/7 monitoring for latest NVIDIA models
- **Quality Benchmarking**: Automated PSNR, SSIM, LPIPS, FID testing
- **A/B Testing**: Compare model versions before production
- **Auto-Rollback**: Revert on quality regression

**Endpoints:**
- `POST /api/render/rtx` - RTX path tracing with AI acceleration
- `POST /api/generate/image` - Photorealistic image generation (Picasso)
- `POST /api/generate/3d` - 3D model synthesis (Edify)
- `POST /api/models/update` - Trigger model update check
- `GET /api/models/info` - Get model versions and status
- `GET /api/capabilities` - List all NVIDIA AI capabilities
- `GET /health` - Service health check

**NVIDIA Technologies:**
- **RTX 545.0+**: Real-time ray tracing, path tracing
- **DLSS 3.5**: AI super-resolution with Ray Reconstruction
- **Neural Radiance Cache**: Instant global illumination
- **OptiX AI Denoiser**: Ultra-low noise rendering
- **Picasso API**: State-of-the-art text-to-image
- **Edify 3D**: Professional 3D asset generation
- **Instant NeRF**: Neural radiance fields

**Auto-Update Workflow:**
1. Service checks NVIDIA API every 24 hours
2. New model version detected → automatic quality benchmarking
3. Metrics calculated (PSNR, SSIM, LPIPS, FID, speed)
4. Decision logic:
   - Quality regression → A/B test required
   - Significant improvement (>10%) → auto-activate
   - Marginal improvement → A/B test
   - Failed benchmarks → reject and alert
5. A/B test runs for 24 hours with traffic split
6. Winner automatically activated
7. Rollback available within 7 days

**Quality Thresholds:**
- Image Generation: PSNR >30dB, SSIM >0.85, LPIPS <0.15, FID <20
- 3D Generation: Mesh quality >0.90, texture resolution ≥2048
- Rendering: PSNR >35dB, SSIM >0.92

**Dependencies:**
- NVIDIA API Key (required)
- Omniverse Kit (optional, for local rendering)
- httpx, fastapi, pydantic

**Integration Points:**
- Unity scenes rendered with RTX path tracing
- CLIP embeddings generated from Picasso outputs
- 3D models imported to USD workflow
- DAO voting on AI-generated assets

---
6. `LoadMusic` ⭐ **NEW** - Fetch and preview music by wallet + style

**Usage:**
```jsx
import { LoadMusic } from './components';

<LoadMusic 
  wallet="0x742d35Cc..." 
  truckStyle="graffiti"
  apiUrl="http://localhost:5300"
/>
```

**Dependencies:**
- React with hooks (useState, useEffect)
- Backend APIs: CLIP service, DAO voting service

---

## Wallet & Blockchain Integration ⭐ **NEW SECTION**

### Wallet Creation Flow

```
1. User runs: python create_contributor_profile.py
2. eth-account generates new keypair
3. User selects truck style (chrome, matte, graffiti, mythic, cyberpunk)
4. Profile JSON saved to contributors/{address}.json
5. User imports private key into MetaMask/wallet app
6. User acquires SoulvanCoin for voting rights
7. Wallet linked to Unity via CLI: soulvan link-wallet --address 0x...
```

### On-Chain Voting Flow

```
1. Job submitted via DAO service (off-chain)
2. Proposal created on SoulvanUpgradeVoting contract
3. Community votes on-chain (requires SoulvanCoin balance)
4. Contract tracks approve/reject tallies
5. If approved, UpgradeApplied event emitted
6. Off-chain listener triggers render service personalization
7. Final artifact uploaded to IPFS with vote results in metadata
```

### Blockchain Sync Architecture

```
┌──────────────────┐
│ DAO Voting API   │ (FastAPI, port 5300)
│ (Off-Chain)      │
└────────┬─────────┘
         │
         ├─ Store votes in PostgreSQL (fast queries)
         └─ Submit to smart contract (on-chain permanence)
                  │
         ┌────────▼────────────┐
         │ SoulvanUpgrade      │ (Solidity)
         │ Voting.sol          │
         └─────────────────────┘
                  │
         Emits: VoteCast, UpgradeApplied events
                  │
         ┌────────▼────────────┐
         │ Event Listener      │ (web3.py/ethers.js)
         │ (Python/Node)       │
         └─────────────────────┘
                  │
         Triggers render service upgrades
```

### Web3 Integration Example

```javascript
// Listen for on-chain votes and sync to database
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, provider);

contract.on("VoteCast", async (jobId, voter, approve, reason) => {
  console.log(`Vote from ${voter}: ${approve ? 'APPROVE' : 'REJECT'}`);
  
  // Sync to PostgreSQL
  await fetch('http://localhost:5300/api/vote', {
    method: 'POST',
    body: JSON.stringify({
      job_id: ethers.utils.parseBytes32String(jobId),
      wallet: voter,
      vote: approve ? 'approve' : 'reject',
      reason: reason,
      tx_hash: event.transactionHash
    })
  });
});
```

---

## Data Flow Diagrams

### Complete Render + Vote Flow

```
┌──────────────┐
│ 1. Wallet    │ create_contributor_profile.py
│ Creation     │ → outputs contributors/0x...json
└──────┬───────┘
       │
┌──────▼───────┐
│ 2. Link      │ soulvan link-wallet --address 0x...
│ Identity     │ → stores in Unity Editor prefs
└──────┬───────┘
       │
┌──────▼───────┐
│ 3. Submit    │ POST /api/jobs (DAO service)
│ Job          │ → job_id: uuid4(), status: submitted
└──────┬───────┘
       │
┌──────▼───────┐
│ 4. Unity     │ SoulvanJobRunner.cs (headless mode)
│ Render       │ → exports USD/EXR to /output
└──────┬───────┘
       │
┌──────▼───────┐
│ 5. CLIP      │ POST /embed → generates vector
│ Embed        │ POST /audit → originality_score
└──────┬───────┘
       │
┌──────▼───────┐
│ 6. Upload    │ POST /upload → S3 + IPFS
│ Artifacts    │ → output_url saved to database
└──────┬───────┘
       │
┌──────▼───────┐
│ 7. DAO       │ POST /api/vote (approve/reject)
│ Voting       │ → on-chain: voteOnUpgrade()
└──────┬───────┘
       │
┌──────▼───────┐
│ 8. Apply     │ If approved: UpgradeApplied event
│ Upgrade      │ → triggers personalization (music, style)
└──────────────┘
```

### Music Integration Flow ⭐

```
┌──────────────────┐
│ Truck Style      │
│ Selection        │ (graffiti, chrome, matte, etc.)
└────────┬─────────┘
         │
┌────────▼─────────┐
│ POST /api/music  │
│ /style           │ wallet + truck_style → music_genre
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Genre Mapper     │ graffiti → hip-hop
│ Logic            │ chrome → synthwave
└────────┬─────────┘
         │
┌────────▼─────────┐
│ LoadMusic        │ <LoadMusic wallet={...} truckStyle={...} />
│ React Component  │ → fetches trackUrl from API
└────────┬─────────┘
         │
┌────────▼─────────┐
│ MusicPreview     │ <audio controls src={trackUrl} />
│ Component        │ → plays personalized track
└──────────────────┘
```

---

## API Integration Examples

### Submit Job + Vote + Apply Upgrade

```bash
# 1. Create wallet (if needed)
cd services/wallet-creator
python create_contributor_profile.py
# Output: contributors/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4.json

# 2. Submit render job
curl -X POST http://localhost:5300/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "Assets/Scenes/cinematic_main.unity",
    "camera": "MainCamera",
    "format": "EXR",
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "sign": true,
    "clip_embed": true
  }'
# Response: {"job_id": "550e8400-e29b-41d4-a716-446655440000", ...}

# 3. Vote on job (off-chain)
curl -X POST http://localhost:5300/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "vote": "approve",
    "reason": "Great composition and lighting"
  }'

# 4. Check vote tally
curl http://localhost:5300/api/vote/550e8400-e29b-41d4-a716-446655440000

# 5. Vote on-chain (using web3.py or ethers.js)
# See contracts/README.md for smart contract integration

# 6. Map truck style to music
curl -X POST http://localhost:5300/api/music/style \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "truck_style": "graffiti",
    "mood": "upbeat"
  }'
# Response: {"music_genre": "hip-hop", "suggested_track": "urban-beats-01.mp3"}
```

### React Integration Example

```jsx
import React from 'react';
import { 
  JobSubmissionForm, 
  JobStatusViewer, 
  DAOVoting,
  LoadMusic 
} from './services/dashboard/components';

function SoulvanApp() {
  const [jobId, setJobId] = React.useState(null);
  const [wallet, setWallet] = React.useState('0x742d35Cc...');
  const [truckStyle, setTruckStyle] = React.useState('graffiti');

  return (
    <div className="soulvan-dashboard">
      <h1>Soulvan Contributor Dashboard</h1>
      
      {/* Submit new render job */}
      <JobSubmissionForm 
        apiUrl="http://localhost:5300"
        onJobSubmit={(data) => setJobId(data.job_id)}
      />
      
      {/* Monitor job progress */}
      {jobId && (
        <>
          <JobStatusViewer 
            jobId={jobId}
            apiUrl="http://localhost:5300"
          />
          
          {/* Vote on completed job */}
          <DAOVoting
            jobId={jobId}
            userWallet={wallet}
            apiUrl="http://localhost:5300"
          />
        </>
      )}
      
      {/* Music preview based on truck style */}
      <LoadMusic
        wallet={wallet}
        truckStyle={truckStyle}
        apiUrl="http://localhost:5300"
      />
    </div>
  );
}
```

---

## Database Schema

See `services/clip-provenance/schema.sql` for full schema.

**Key Tables:**

1. **render_jobs** - Job metadata and status
2. **clip_embeddings** - CLIP vectors for originality
3. **dao_votes** - Community votes (synced from chain)
4. **music_styles** - Wallet style preferences

**PostgreSQL Setup:**

```bash
# Create database
createdb soulvan

# Initialize schema
psql -d soulvan -f services/clip-provenance/schema.sql

# Environment variables
export DB_HOST=localhost
export DB_NAME=soulvan
export DB_USER=soulvan
export DB_PASSWORD=secret_password
export DB_PORT=5432
```

---

## Security & Authentication

### Current State (Development)

- No authentication on API endpoints
- Private keys stored in plain JSON (wallet creator)
- PostgreSQL without SSL

### Production Requirements

1. **API Authentication:**
   - Add JWT tokens to all endpoints
   - Implement wallet signature verification
   - Rate limiting per wallet address

2. **Key Management:**
   - Migrate to hardware wallets (Ledger/Trezor)
   - Use KMS/HSM for signing (AWS KMS, HashiCorp Vault)
   - Never store private keys in database

3. **Smart Contract Security:**
   - Professional audit of SoulvanUpgradeVoting.sol
   - Implement timelocks for upgrades
   - Add emergency pause functionality
   - Protect against flash loan attacks

4. **Database Security:**
   - Enable PostgreSQL SSL connections
   - Use connection pooling with pgBouncer
   - Encrypt sensitive columns (AES-256)

---

## Monitoring & Observability

### Metrics to Track

**Service Health:**
- Request latency (p50, p95, p99)
- Error rates per endpoint
- Database query performance
- CLIP model inference time

**Business Metrics:**
- Jobs submitted per hour
- Originality score distribution
- Vote participation rate
- On-chain transaction costs

**Infrastructure:**
- CPU/memory usage per service
- PostgreSQL connection pool utilization
- S3/IPFS upload bandwidth
- Blockchain gas prices

### Recommended Stack

- **Metrics:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing:** Jaeger for distributed traces
- **Alerting:** PagerDuty/Opsgenie

---

## Scaling Strategies

### Horizontal Scaling

- Deploy multiple instances behind load balancer (NGINX/HAProxy)
- Use Redis for session state and caching
- Separate read replicas for PostgreSQL
- CDN for static assets and rendered outputs

### Async Processing

- Add Celery for background job processing
- Use RabbitMQ/Redis as message broker
- Queue structure:
  - `render_jobs` - Unity rendering tasks
  - `clip_embeddings` - CLIP inference tasks
  - `upload_artifacts` - S3/IPFS uploads

### Database Optimization

- Partition `render_jobs` by created_at (monthly)
- Use vector database for CLIP embeddings (Milvus/Pinecone)
- Cache frequently accessed jobs in Redis

---

## Deployment Guide

### Local Development

```bash
# 1. Start PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=soulvan \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# 2. Initialize schema
psql -h localhost -U postgres -d soulvan -f services/clip-provenance/schema.sql

# 3. Start CLIP service
cd services/clip-provenance
pip install -r requirements.txt
python server.py  # Port 5200

# 4. Start DAO voting service
cd services/dao-voting
pip install -r requirements.txt
python server.py  # Port 5300

# 5. Test workflow
curl http://localhost:5300/health
curl http://localhost:5200/health
```

### Production Deployment (Docker)

```dockerfile
# Dockerfile for CLIP service
FROM python:3.10-slim

WORKDIR /app
COPY services/clip-provenance/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/clip-provenance/ .

ENV DB_HOST=postgres \
    DB_NAME=soulvan \
    PORT=5200

CMD ["python", "server.py"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: soulvan
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./services/clip-provenance/schema.sql:/docker-entrypoint-initdb.d/schema.sql
      - postgres_data:/var/lib/postgresql/data

  clip-service:
    build:
      context: .
      dockerfile: Dockerfile.clip
    ports:
      - "5200:5200"
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      AWS_BUCKET: ${AWS_BUCKET}
      PINATA_API_KEY: ${PINATA_API_KEY}

  dao-service:
    build:
      context: .
      dockerfile: Dockerfile.dao
    ports:
      - "5300:5300"
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres

volumes:
  postgres_data:
```

Deploy: `docker-compose up -d`

---

## Related Documentation

- **Smart Contracts:** `contracts/README.md`
- **Wallet Creator:** `services/wallet-creator/README.md`
- **CLIP Service:** `services/clip-provenance/README.md`
- **DAO Voting:** `services/dao-voting/README.md`
- **Dashboard Components:** `services/dashboard/README.md`
- **CLI Tools:** `soulvan-cli/README.md`

---

**Last Updated:** November 2025  
**Version:** 3.0 (Added wallet & blockchain integration)
