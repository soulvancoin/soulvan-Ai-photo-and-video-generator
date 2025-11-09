# Soulvan Complete Workflow Guide

End-to-end guide for contributors using the complete Soulvan AI Photo & Video pipeline.

## Table of Contents

1. [Quick Start (10 minutes)](#quick-start)
2. [Onboarding Workflow](#onboarding-workflow)
3. [Rendering Workflow](#rendering-workflow)
4. [Voting & Community](#voting--community)
5. [Music Integration](#music-integration)
6. [Automation Scripts](#automation-scripts)

---

## Quick Start

Complete workflow from wallet creation to render + vote:

```bash
# 1. Create Ethereum wallet
cd services/wallet-creator
pip install -r requirements.txt
python create_contributor_profile.py
# Follow prompts → outputs contributors/0x....json

# 2. Start services
# Terminal 1: PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_DB=soulvan -e POSTGRES_PASSWORD=secret postgres:15

# Terminal 2: CLIP Service
cd services/clip-provenance
pip install -r requirements.txt
python server.py  # Port 5200

# Terminal 3: DAO Voting Service
cd services/dao-voting
pip install -r requirements.txt
python server.py  # Port 5300

# 3. Initialize database
psql -h localhost -U postgres -d soulvan -f services/clip-provenance/schema.sql

# 4. Submit job via automation
cd services/dao-voting
python automation.py \
  --wallet YOUR_WALLET_ADDRESS \
  --style graffiti \
  --scene Assets/Scenes/cinematic_main.unity \
  --full-workflow

# 5. Vote on job via dashboard
# Open services/dashboard/components.jsx in React app
```

---

## Onboarding Workflow

### Step 1: Create Wallet

```bash
cd services/wallet-creator
python create_contributor_profile.py
```

**Interactive prompts:**
```
🚚 Choose your Soulvan truck style:
1. chrome       → synthwave, electronica
2. matte        → deep house, minimal techno
3. graffiti     → hip-hop, trap
4. mythic       → orchestral, epic
5. cyberpunk    → industrial, glitch-hop

Enter number (1-5): 3

✅ Wallet created: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4
✅ Selected style: graffiti
💾 Profile saved to: contributors/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4.json
```

**Output file:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "truck_style": "graffiti",
  "private_key": "0x...",
  "created_at": "2025-11-09T12:00:00Z"
}
```

### Step 2: Create Profile in Database

```bash
curl -X POST http://localhost:5300/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "truck_style": "graffiti"
  }'
```

### Step 3: Acquire SoulvanCoin (Optional)

For on-chain voting rights, acquire SoulvanCoin tokens:

```bash
# Using web3.py or ethers.js
# Example: Purchase from DEX or claim from faucet
```

---

## Rendering Workflow

### Option A: Manual Job Submission

```bash
# Submit via API
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

# Response
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

### Option B: Automated Workflow (Recommended)

```bash
cd services/dao-voting

# Submit job with auto render trigger
python automation.py \
  --wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4 \
  --style graffiti \
  --scene Assets/Scenes/cinematic_main.unity
```

### Option C: Complete Workflow (Profile + Job + Music)

```bash
# One command for complete onboarding
python automation.py \
  --wallet 0x742d35Cc... \
  --style graffiti \
  --scene Assets/Scenes/test.unity \
  --full-workflow
```

**Output:**
```
============================================================
🎬 SOULVAN COMPLETE WORKFLOW
============================================================

1️⃣ Creating profile...
   ✅ Profile created for 0x742d35Cc...

2️⃣ Submitting render job...
   ✅ Job submitted: 550e8400-e29b-41d4-a716-446655440000
   📁 Output path: s3://soulvan-renders/0x742d35Cc.../
   🎨 Truck style: graffiti

3️⃣ Generating music preview...
   🎵 Music generated!
   Style: graffiti → Genre: hip-hop
   Preview: https://soulvan-music.s3.amazonaws.com/hip-hop/0x742d35.mp3

============================================================
✅ WORKFLOW COMPLETE
============================================================
```

---

## Voting & Community

### Off-Chain Voting (Fast, Free)

```bash
# Vote via API
curl -X POST http://localhost:5300/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "vote": "approve",
    "reason": "Great lighting and composition"
  }'

# Check tally
curl http://localhost:5300/api/vote/550e8400-e29b-41d4-a716-446655440000
```

### On-Chain Voting (Requires SoulvanCoin)

```javascript
// Using ethers.js
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const votingContract = new ethers.Contract(
  VOTING_CONTRACT_ADDRESS,
  SoulvanUpgradeVotingABI,
  signer
);

// Cast vote on-chain
const tx = await votingContract.voteOnUpgrade(
  ethers.utils.formatBytes32String("550e8400-e29b-41d4-a716-446655440000"),
  true, // approve
  "Excellent work!"
);

await tx.wait();
console.log(`Vote recorded: ${tx.hash}`);
```

### React Dashboard Voting

```jsx
import { DAOVoting } from './services/dashboard/components';

<DAOVoting
  jobId="550e8400-e29b-41d4-a716-446655440000"
  userWallet="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
  apiUrl="http://localhost:5300"
/>
```

---

## Music Integration

### Generate Music Preview

```bash
curl -X POST http://localhost:5300/api/music \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "truckStyle": "graffiti"
  }'
```

**Response:**
```json
{
  "trackUrl": "https://soulvan-music.s3.amazonaws.com/hip-hop/0x742d35.mp3",
  "genre": "hip-hop",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "truck_style": "graffiti"
}
```

### React Music Player

```jsx
import { LoadMusic } from './services/dashboard/components';

<LoadMusic
  wallet="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
  truckStyle="graffiti"
  apiUrl="http://localhost:5300"
/>
```

### Truck Style → Music Genre Mapping

| Truck Style | Music Genre | Example Artists |
|------------|-------------|-----------------|
| graffiti   | hip-hop     | Run-DMC, Public Enemy |
| chrome     | synthwave   | Kavinsky, Perturbator |
| matte      | ambient     | Brian Eno, Boards of Canada |
| mythic     | orchestral  | Hans Zimmer, Two Steps From Hell |
| cyberpunk  | industrial  | Nine Inch Nails, Front 242 |
| neon       | synthwave   | The Midnight, FM-84 |
| rust       | industrial  | Ministry, Skinny Puppy |

---

## Automation Scripts

### Helper Functions

```python
from services.dao_voting.automation import (
    auto_submit_job,
    trigger_music_preview,
    create_profile_and_submit_job,
    get_music_style
)

# 1. Submit job with automation
job_id = auto_submit_job(
    wallet="0x742d35Cc...",
    truck_style="graffiti",
    scene="Assets/Scenes/cinematic_main.unity"
)

# 2. Generate music
track_url = trigger_music_preview("0x742d35Cc...", "graffiti")

# 3. Complete workflow
result = create_profile_and_submit_job(
    wallet="0x742d35Cc...",
    truck_style="graffiti",
    scene="Assets/Scenes/test.unity"
)

print(f"Job: {result['job_id']}")
print(f"Music: {result['track_url']}")
```

### CLI Commands

```bash
# Create wallet
python services/wallet-creator/create_contributor_profile.py

# Submit job
python services/dao-voting/automation.py \
  --wallet 0x... \
  --style graffiti \
  --scene Assets/Scenes/test.unity

# Full workflow
python services/dao-voting/automation.py \
  --wallet 0x... \
  --style graffiti \
  --scene Assets/Scenes/test.unity \
  --full-workflow
```

---

## Production Checklist

Before deploying to production:

### Security
- [ ] Add JWT authentication to all API endpoints
- [ ] Implement wallet signature verification for votes
- [ ] Migrate private keys to hardware wallets (Ledger/Trezor)
- [ ] Enable PostgreSQL SSL connections
- [ ] Add rate limiting per wallet address
- [ ] Audit smart contracts professionally

### Infrastructure
- [ ] Deploy services to Docker/Kubernetes
- [ ] Set up PostgreSQL read replicas
- [ ] Configure S3/IPFS for artifact storage
- [ ] Add Redis for caching and job queues
- [ ] Implement Celery for async job processing
- [ ] Set up CDN for artifact delivery

### Monitoring
- [ ] Add Prometheus metrics
- [ ] Configure Grafana dashboards
- [ ] Set up ELK stack for logging
- [ ] Implement PagerDuty/Opsgenie alerts
- [ ] Add distributed tracing with Jaeger

### Smart Contracts
- [ ] Deploy SoulvanCoin ERC20 contract
- [ ] Deploy SoulvanUpgradeVoting contract
- [ ] Set up event listeners for on-chain votes
- [ ] Implement vote result syncing to PostgreSQL
- [ ] Add emergency pause functionality

---

## Troubleshooting

### Services Not Starting

```bash
# Check PostgreSQL connection
psql -h localhost -U postgres -d soulvan -c "SELECT 1"

# Check service health
curl http://localhost:5200/health  # CLIP service
curl http://localhost:5300/health  # DAO service
```

### Database Errors

```bash
# Reinitialize schema
psql -h localhost -U postgres -d soulvan -f services/clip-provenance/schema.sql

# Check tables
psql -h localhost -U postgres -d soulvan -c "\dt"
```

### Import Errors (Python)

```bash
# Reinstall dependencies
cd services/clip-provenance
pip install -r requirements.txt

cd services/dao-voting
pip install -r requirements.txt
```

---

## Related Documentation

- **Architecture**: `services/SERVICES_ARCHITECTURE.md`
- **Smart Contracts**: `contracts/README.md`
- **CLIP Service**: `services/clip-provenance/README.md`
- **DAO Voting**: `services/dao-voting/README.md`
- **Wallet Creator**: `services/wallet-creator/README.md`
- **Dashboard Components**: `services/dashboard/README.md`

---

**Last Updated:** November 2025  
**Version:** 4.0 (Automation & Music APIs)
