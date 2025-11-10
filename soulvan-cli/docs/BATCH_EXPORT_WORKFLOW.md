# Batch Export & Job Runner Workflow

## Overview

The Soulvan pipeline supports headless Unity batch rendering via job configs. This enables automated USD/EXR exports with provenance signing and CLIP-based originality scoring.

## Components

### 1. Unity C# Scripts

Located in `soulvan-cli/unity/Assets/Scripts/Editor/`:

- **SoulvanUSDExporter.cs** - Batch export all scenes to USD format with wallet metadata
- **SoulvanEXRRecorderSetup.cs** - Record EXR frame sequences using Unity Recorder
- **SoulvanJobRunner.cs** - Headless CLI entry point that processes job config JSON

### 2. CLI Command

```bash
soulvan job:run <configPath> [options]
```

Options:
- `-u, --unity-path <path>` - Path to Unity editor binary (default: `/opt/Unity/Editor/Unity`)
- `-p, --project-path <path>` - Path to Unity project (default: `soulvan-cli/unity`)

### 3. Job Config Format

JSON file specifying render parameters:

```json
{
  "scene": "Assets/Scenes/cinematic/cinematic_main.unity",
  "camera": "CineCamera",
  "output": "Exports/USD/cinematic_main.usd",
  "format": "USD",
  "sign": true,
  "clip_embed": true
}
```

Fields:
- `scene` - Unity scene path
- `camera` - Camera GameObject name
- `output` - Export output path
- `format` - "USD" or "EXR"
- `sign` - Call provenance signer service
- `clip_embed` - Generate CLIP preview for originality check

### 4. CLIP Provenance Service

Python Flask service (port 5200) providing:

- `/audit` - Originality scoring via CLIP embeddings
- `/index` - Add artifacts to known corpus
- `/sign` - Provenance signing (demo placeholder)
- `/embed` - Generate CLIP vectors

Start service:
```bash
cd services/clip-provenance
pip install -r requirements.txt
python server.py
```

## Workflow

### Setup

1. Install Unity packages:
   - `com.unity.formats.usd` (USD export)
   - `com.unity.recorder` (EXR recording)

2. Link wallet identity:
   ```bash
   soulvan link-wallet 0xYourWalletAddress
   ```

3. Start CLIP service:
   ```bash
   cd services/clip-provenance && python server.py
   ```

### Run a Job

**Using CLI:**
```bash
soulvan job:run samples/sample-job-config.json
```

**Using Shell Script:**
```bash
./scripts/run-unity-job.sh samples/sample-job-config.json
```

**Direct Unity:**
```bash
/opt/Unity/Editor/Unity \
  -batchmode -nographics \
  -projectPath soulvan-cli/unity \
  -executeMethod SoulvanJobRunner.Run \
  --config /absolute/path/to/job.json \
  -quit
```

### Manual Export (In-Editor)

Open Unity project and use menu items:

- **Soulvan > Export > All Scenes -> USD** - Batch export all scenes
- **Soulvan > Record > EXR Sequence** - Record 120 frame EXR sequence

## Environment Variables

- `UNITY_BIN` - Path to Unity editor (default: `/opt/Unity/Editor/Unity`)
- `PROVENANCE_SIGNER_URL` - Signer service endpoint (default: `http://localhost:4100/sign`)

## Output Structure

```
Exports/
├── USD/
│   ├── scene_name.usd
│   └── scene_name.meta.json
└── EXR/
    ├── frame_0001.exr
    ├── frame_0002.exr
    └── ...
```

Metadata files include:
- Wallet address
- Export timestamp
- Scene name
- Provenance signature (if signing enabled)

## CI/CD Integration

Add job execution to GitHub Actions:

```yaml
- name: Run Unity Export Job
  env:
    UNITY_BIN: /opt/Unity/Editor/Unity
  run: |
    soulvan job:run ci/job-config.json
```

## Next Steps

- Replace placeholder signing with real KMS/HSM integration
- Add GPU worker pool and job queue (Redis/RabbitMQ)
- Implement persistent CLIP vector database (Milvus/Pinecone)
- Add authentication and rate limiting to services
