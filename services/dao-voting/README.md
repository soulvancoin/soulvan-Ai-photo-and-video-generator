# DAO Voting Service

FastAPI service for Soulvan DAO voting, job submission, and music style mapping.

## Setup

```bash
pip install -r requirements.txt
```

## Database

Ensure PostgreSQL is running with the Soulvan schema loaded:

```bash
psql -U postgres -d soulvan -f ../clip-provenance/schema.sql
```

## Environment Variables

```bash
export DB_NAME=soulvan
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
```

## Run

```bash
python server.py
```

Service listens on port 5300.

## API Endpoints

### Job Management

## API Endpoints

### 1. Submit Render Job

**POST** `/api/jobs`

Submit a new render job for processing.

**Request Body:**
```json
{
  "scene": "Assets/Scenes/cinematic_main.unity",
  "camera": "MainCamera",
  "format": "EXR",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "sign": true,
  "clip_embed": true
}
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Job submitted successfully"
}
```

### 2. Get Job Status

**Get Job Status**
```bash
GET /api/jobs/{job_id}
```

### DAO Voting

**Submit Vote**
```bash
POST /api/vote
{
  "job_id": "uuid-here",
  "wallet": "0xABC123",
  "vote": "approve",
  "reason": "Great cinematic lighting"
}
```

**Get Votes**
```bash
GET /api/vote/{job_id}
```

Returns:
```json
{
  "job_id": "uuid",
  "votes": [...],
  "tally": {
    "approve": 15,
    "reject": 3
  }
}
```

### Music Style Mapping

**Get Music Style**
```bash
POST /api/music/style
{
  "wallet": "0xABC123",
  "truck_style": "graffiti",
  "mood": "cinematic"
}
```

Returns:
```json
{
  "wallet": "0xABC123",
  "truck_style": "graffiti",
  "music_genre": "hip-hop",
  "mood": "cinematic",
  "suggested_track": "/tracks/hip-hop/cinematic/001.mp3"
}
```

### 6. Generate Music Track ⭐ **NEW**

**POST** `/api/music`

Generate personalized music track based on wallet and truck style.

**Request Body:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "truckStyle": "graffiti"
}
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

### 7. Create Profile ⭐ **NEW**

**POST** `/api/profile`

Create or update contributor profile with truck style preference.

**Request Body:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "truck_style": "graffiti",
  "preferences": {}
}
```

**Response:**
```json
{
  "status": "Profile saved",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "truck_style": "graffiti",
  "created_at": "2025-11-09T12:00:00"
}
```

## Automation Utilities ⭐ **NEW**

The `automation.py` module provides helper functions for workflow automation:

### auto_submit_job()

Complete job submission with S3 path generation and render triggering.

```python
from automation import auto_submit_job

job_id = auto_submit_job(
    wallet="0x742d35Cc...",
    truck_style="graffiti",
    scene="Assets/Scenes/cinematic_main.unity",
    camera="MainCamera"
)
print(f"Job submitted: {job_id}")
```

### trigger_music_preview()

Generate and preview music track.

```python
from automation import trigger_music_preview

track_url = trigger_music_preview("0x742d35Cc...", "graffiti")
print(f"Preview your track: {track_url}")
```

### create_profile_and_submit_job()

Complete onboarding workflow: profile creation + job submission + music generation.

```python
from automation import create_profile_and_submit_job

result = create_profile_and_submit_job(
    wallet="0x742d35Cc...",
    truck_style="graffiti",
    scene="Assets/Scenes/cinematic_main.unity"
)
print(f"Job ID: {result['job_id']}")
print(f"Music: {result['track_url']}")
```

### CLI Usage

```bash
# Submit job via automation script
python automation.py \
  --wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4 \
  --style graffiti \
  --scene Assets/Scenes/cinematic_main.unity

# Run full workflow (profile + job + music)
python automation.py \
  --wallet 0x742d35Cc... \
  --style graffiti \
  --scene Assets/Scenes/test.unity \
  --full-workflow
```

## Interactive API Docs

FastAPI provides automatic interactive documentation:

- Swagger UI: `http://localhost:5300/docs`
- ReDoc: `http://localhost:5300/redoc`

## Example Workflow

```bash
# 1. Create profile
curl -X POST http://localhost:5300/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc...",
    "truck_style": "graffiti"
  }'

# 2. Submit a render job
JOB_ID=$(curl -X POST http://localhost:5300/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "Assets/Scenes/test.unity",
    "camera": "Camera",
    "format": "EXR",
    "wallet": "0x742d35Cc..."
  }' | jq -r '.job_id')

# 3. Generate music preview
curl -X POST http://localhost:5300/api/music \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc...",
    "truckStyle": "graffiti"
  }'

# 4. Vote on the job
curl -X POST http://localhost:5300/api/vote \
  -H "Content-Type: application/json" \
  -d "{
    \"job_id\": \"$JOB_ID\",
    \"wallet\": \"0xVOTER1\",
    \"vote\": \"approve\",
    \"reason\": \"Excellent quality\"
  }"

# 5. Check vote tally
curl http://localhost:5300/api/vote/$JOB_ID

# 6. Get music style mapping
curl -X POST http://localhost:5300/api/music/style \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc...",
    "truck_style": "chrome",
    "mood": "cinematic"
  }'
```

## Integration with Unity

From Unity C# scripts, call the API after job completion:

```csharp
var payload = new {
    scene = "Assets/Scenes/demo.unity",
    camera = "MainCamera",
    format = "USD",
    wallet = ReadWalletFromResources()
};
var json = JsonUtility.ToJson(payload);
var request = UnityWebRequest.Post("http://localhost:5300/api/jobs", json, "application/json");
yield return request.SendWebRequest();
```

## Security Notes

- Add JWT authentication for production
- Validate wallet signatures to prevent vote manipulation
- Rate limit endpoints to prevent spam
- Use HTTPS for all communications
- Store wallet private keys in secure vaults only
