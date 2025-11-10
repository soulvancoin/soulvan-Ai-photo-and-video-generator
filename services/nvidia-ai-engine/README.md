# NVIDIA AI Engine Service

World-class photorealistic rendering and AI generation powered by latest NVIDIA technologies.

## 🚀 Features

### Rendering Technologies
- **RTX Global Illumination** - Full path tracing with AI acceleration
- **DLSS 3.5 Ray Reconstruction** - Neural super-resolution for real-time quality
- **Neural Radiance Cache (NRC)** - Instant GI caching with neural networks
- **OptiX AI Denoising** - Ultra-low noise at low sample counts
- **8K Output** - Up to 7680x4320 resolution support

### AI Generation
- **NVIDIA Picasso** - Photorealistic image generation (Stable Diffusion XL)
- **NVIDIA Edify 3D** - Text/image to 3D model synthesis
- **Instant NeRF** - Neural radiance fields for volumetric rendering

### Smart Auto-Update System
- **24/7 Monitoring** - Checks NVIDIA API for model updates
- **Quality Benchmarking** - Automated PSNR, SSIM, LPIPS, FID testing
- **A/B Testing** - Compare versions before production deployment
- **Auto-Rollback** - Revert to stable version on quality regression

## 📦 Installation

```bash
cd services/nvidia-ai-engine
pip install -r requirements.txt
```

## 🔑 Configuration

```bash
# Required: NVIDIA API access
export NVIDIA_API_KEY="your_nvidia_api_key"

# Optional: Custom endpoints
export PICASSO_API_URL="https://api.nvcf.nvidia.com/v2/nvcf"
export OMNIVERSE_URL="http://localhost:8211"

# Model registry path
export MODEL_REGISTRY="./models/registry.json"
```

## 🎮 Quick Start

```bash
# Start service
python server.py  # Runs on port 5400

# Check health
curl http://localhost:5400/health

# Get AI capabilities
curl http://localhost:5400/api/capabilities
```

## 📡 API Endpoints

### 1. RTX Rendering

**POST** `/api/render/rtx`

Render scene with NVIDIA RTX path tracing.

```bash
curl -X POST http://localhost:5400/api/render/rtx \
  -H "Content-Type: application/json" \
  -d '{
    "scene_path": "/path/to/scene.usd",
    "camera": "Camera",
    "resolution": [3840, 2160],
    "samples": 1024,
    "enable_rtx_gi": true,
    "enable_dlss": true,
    "enable_nrc": true,
    "denoiser": "OptiX",
    "output_format": "EXR"
  }'
```

**Response:**
```json
{
  "job_id": "abc123...",
  "status": "rendering",
  "estimated_time": 60,
  "renderer_version": "545.0"
}
```

### 2. Generate Photorealistic Image

**POST** `/api/generate/image`

Generate images using NVIDIA Picasso API.

```bash
curl -X POST http://localhost:5400/api/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic cyberpunk truck with neon graffiti, cinematic lighting, 8K, photorealistic",
    "negative_prompt": "blurry, low quality, distorted",
    "style": "photorealistic",
    "width": 1024,
    "height": 1024,
    "guidance_scale": 7.5,
    "steps": 50
  }'
```

**Response:**
```json
{
  "image_url": "https://api.nvcf.nvidia.com/v2/nvcf/...",
  "seed": 42,
  "model_version": "1.0.0",
  "inference_time": 3.2
}
```

### 3. Generate 3D Model

**POST** `/api/generate/3d`

Create 3D USD models from text or images.

```bash
curl -X POST http://localhost:5400/api/generate/3d \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A sleek chrome truck with detailed wheels",
    "topology": "quad",
    "resolution": 2048
  }'
```

**Response:**
```json
{
  "model_url": "https://api.nvcf.nvidia.com/.../model.usd",
  "preview_url": "https://api.nvcf.nvidia.com/.../preview.png",
  "topology": "quad",
  "model_version": "1.0.0"
}
```

### 4. Trigger Model Update

**POST** `/api/models/update`

Manually check for and install AI model updates.

```bash
curl -X POST http://localhost:5400/api/models/update \
  -H "Content-Type: application/json" \
  -d '{"force_update": true}'
```

**Response:**
```json
{
  "status": "updated",
  "models": ["picasso_xl"],
  "updates": {
    "picasso_xl": {
      "current": "1.0.0",
      "latest": "1.1.0",
      "changelog": "Improved photorealism and faster inference"
    }
  }
}
```

### 5. Get Models Info

**GET** `/api/models/info`

Get information about all AI models and versions.

```bash
curl http://localhost:5400/api/models/info
```

### 6. Get Capabilities

**GET** `/api/capabilities`

Get current NVIDIA AI capabilities.

```bash
curl http://localhost:5400/api/capabilities
```

**Response:**
```json
{
  "rendering": {
    "rtx_version": "545.0",
    "features": [
      "RTX Global Illumination",
      "DLSS 3.5 Ray Reconstruction",
      "Neural Radiance Cache",
      "OptiX AI Denoising"
    ],
    "max_resolution": "8K (7680x4320)"
  },
  "ai_generation": {
    "image": {
      "model": "NVIDIA Picasso (Stable Diffusion XL)",
      "version": "1.0.0",
      "max_resolution": "2048x2048"
    },
    "3d": {
      "model": "NVIDIA Edify 3D",
      "version": "1.0.0",
      "output_formats": ["USD", "OBJ", "FBX"]
    }
  },
  "auto_update": {
    "enabled": true,
    "check_interval_hours": 24
  }
}
```

## 🧪 Model Version Management

Test and manage AI model versions with quality benchmarking:

```bash
# Test new model version
python model_version_manager.py \
  --model picasso_xl \
  --version 1.1.0 \
  --changelog "Improved photorealism" \
  --test-version

# Activate version after testing
python model_version_manager.py \
  --model picasso_xl \
  --version 1.1.0 \
  --activate

# Rollback to previous version
python model_version_manager.py \
  --model picasso_xl \
  --rollback

# Generate quality report
python model_version_manager.py \
  --model picasso_xl \
  --report
```

## 📊 Quality Metrics

Automated benchmarking includes:

- **PSNR** (Peak Signal-to-Noise Ratio) - Higher is better (>30 dB)
- **SSIM** (Structural Similarity) - Higher is better (>0.85)
- **LPIPS** (Perceptual Similarity) - Lower is better (<0.15)
- **FID** (Fréchet Inception Distance) - Lower is better (<20)
- **Inference Time** - Lower is better (<5000 ms)

## 🔄 Auto-Update Workflow

```
1. Service checks NVIDIA API every 24 hours
2. New version detected → automatic benchmarking
3. Quality score calculated from metrics
4. Decision logic:
   - Quality regression → A/B test required
   - Significant improvement → auto-activate
   - Marginal improvement → A/B test
   - Failed benchmarks → reject
5. A/B test (if required) runs for 24 hours
6. Winner automatically activated
7. Rollback available if issues detected
```

## 🎨 Integration Examples

### Python SDK

```python
import httpx

# Generate photorealistic image
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:5400/api/generate/image",
        json={
            "prompt": "Cinematic truck scene, golden hour lighting",
            "style": "photorealistic",
            "width": 2048,
            "height": 2048
        }
    )
    data = response.json()
    print(f"Image URL: {data['image_url']}")
```

### Unity Integration

```csharp
// Call from Unity C#
var request = new UnityWebRequest("http://localhost:5400/api/render/rtx", "POST");
var jsonData = JsonUtility.ToJson(new {
    scene_path = "Assets/Scenes/truck.usd",
    enable_dlss = true,
    samples = 1024
});
request.uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(jsonData));
request.SetRequestHeader("Content-Type", "application/json");

yield return request.SendWebRequest();
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│         NVIDIA AI Engine (Port 5400)         │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐  ┌─────────────┐           │
│  │ RTX        │  │ Picasso     │           │
│  │ Renderer   │  │ Image Gen   │           │
│  └────────────┘  └─────────────┘           │
│                                              │
│  ┌────────────┐  ┌─────────────┐           │
│  │ Edify 3D   │  │ Neural      │           │
│  │ Synthesis  │  │ Graphics    │           │
│  └────────────┘  └─────────────┘           │
│                                              │
│  ┌──────────────────────────────┐           │
│  │   Auto-Update System         │           │
│  │   - Version Manager          │           │
│  │   - Quality Benchmarking     │           │
│  │   - A/B Testing              │           │
│  └──────────────────────────────┘           │
│                                              │
└──────────────────────────────────────────────┘
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│ NVIDIA API      │  │ Omniverse Kit    │
│ (Cloud)         │  │ (Local)          │
└─────────────────┘  └──────────────────┘
```

## 🔒 Security

- **API Key Management**: Store `NVIDIA_API_KEY` in secure vault (e.g., AWS Secrets Manager)
- **Rate Limiting**: Implement per-user rate limits
- **Input Validation**: All prompts sanitized before API calls
- **Output Sanitization**: Filter generated content for policy compliance

## 📈 Performance Optimization

### RTX Rendering
- Enable **DLSS** for 2-4x performance boost
- Use **Neural Radiance Cache** for instant GI
- Adjust sample count based on scene complexity
- Use **OptiX denoiser** at low sample counts

### AI Generation
- Cache frequently used prompts
- Use lower guidance scale (5-7) for faster inference
- Batch multiple requests when possible
- Enable async generation for non-blocking operations

## 🐛 Troubleshooting

### API Key Not Working
```bash
# Verify API key is set
echo $NVIDIA_API_KEY

# Test API access
curl -H "Authorization: Bearer $NVIDIA_API_KEY" \
  https://api.nvcf.nvidia.com/v2/nvcf/version
```

### Model Update Fails
```bash
# Check network connectivity
curl https://api.nvcf.nvidia.com

# Force manual update
python model_version_manager.py --model picasso_xl --test-version
```

### Poor Render Quality
```bash
# Increase samples
"samples": 2048  # Default: 1024

# Enable all quality features
"enable_rtx_gi": true,
"enable_dlss": true,
"enable_nrc": true
```

## 📚 Related Documentation

- **NVIDIA Picasso**: https://www.nvidia.com/en-us/gpu-cloud/picasso/
- **NVIDIA Edify**: https://www.nvidia.com/en-us/ai-data-science/products/edify/
- **Omniverse RTX**: https://docs.omniverse.nvidia.com/
- **DLSS Documentation**: https://developer.nvidia.com/dlss

## 🎯 Roadmap

- [ ] NVIDIA NeMo for voice/music generation
- [ ] Integration with NVIDIA Maxine for video enhancement
- [ ] Support for NVIDIA Modulus for physics simulation
- [ ] Multi-GPU rendering orchestration
- [ ] Real-time preview with NVIDIA CloudXR

---

**Service:** NVIDIA AI Engine  
**Port:** 5400  
**Version:** 1.0.0  
**Last Updated:** November 2025
