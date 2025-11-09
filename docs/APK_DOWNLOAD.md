# Soulvan AI - APK Download & Installation Guide

## 📱 Download the Android App

### Option 1: GitHub Releases (Recommended)
Download the latest APK from [GitHub Releases](https://github.com/44547/soulvan-Ai-photo-and-video-generator/releases):

1. Go to the **Releases** page
2. Find the latest version (e.g., v1.0.0)
3. Download **SoulvanAI-v1.0.0.apk** (~25 MB)

### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/44547/soulvan-Ai-photo-and-video-generator.git
cd soulvan-Ai-photo-and-video-generator

# Build APK
chmod +x scripts/build-apk.sh
./scripts/build-apk.sh

# Find APK at: build/apk/SoulvanAI-v1.0.0.apk
```

### Option 3: GitHub Actions Artifacts
Every commit to `main` automatically builds an APK:

1. Go to [Actions](https://github.com/44547/soulvan-Ai-photo-and-video-generator/actions)
2. Click the latest **Build Android APK** workflow
3. Download the **soulvan-ai-apk** artifact
4. Extract the ZIP to get the APK file

---

## 📲 Installation Instructions

### Prerequisites
- Android device running **Android 7.0 (API 24)** or higher
- ~100 MB free storage space
- Internet connection

### Step-by-Step Installation

#### 1. Enable Unknown Sources
Since this APK is not from the Google Play Store:

**Android 8.0+:**
1. Go to **Settings** → **Apps & notifications**
2. Tap **Advanced** → **Special app access**
3. Tap **Install unknown apps**
4. Select your browser/file manager
5. Enable **Allow from this source**

**Android 7.x:**
1. Go to **Settings** → **Security**
2. Enable **Unknown sources**
3. Tap **OK** to confirm

#### 2. Download APK
Transfer the APK to your Android device:
- **Direct download:** Use device browser to download from GitHub
- **Transfer from PC:** Use USB cable or cloud storage (Google Drive, Dropbox)
- **ADB install:** `adb install SoulvanAI-v1.0.0.apk`

#### 3. Install APK
1. Open your **File Manager** app
2. Navigate to **Downloads** folder
3. Tap on **SoulvanAI-v1.0.0.apk**
4. Tap **Install**
5. Wait for installation to complete
6. Tap **Open** to launch

#### 4. Grant Permissions
The app will request these permissions:
- **Internet** - Required for API calls to NVIDIA, CLIP, DAO services
- **Storage** - To save generated images and videos
- **Camera** - For QR code scanning (wallet features)

---

## 🎨 Features

### AI Image Generation
- **NVIDIA Picasso API** integration
- Generate photorealistic images from text prompts
- Multiple style presets (Photorealistic, Artistic, Cinematic, 3D)
- Resolution up to 2048x2048 pixels

### RTX Video Rendering
- **NVIDIA RTX path tracing** for cinematic quality
- **DLSS 3.5** Ray Reconstruction
- Neural Radiance Cache for instant Global Illumination
- OptiX AI Denoising
- 4K and 8K resolution support

### Crypto Wallet
- Create Ethereum wallet in-app
- Manage Soulvan (SOULVAN) tokens
- View NFT collection
- Secure key storage

### DAO Voting
- Vote on platform upgrades
- View active proposals
- Track voting results in real-time
- Transparent governance

---

## ⚙️ Configuration

### API Endpoints
By default, the app connects to localhost (for development):
- CLIP Provenance: `http://10.0.2.2:5200`
- DAO Voting: `http://10.0.2.2:5300`
- NVIDIA AI: `http://10.0.2.2:5400`

**For production use**, configure in app settings:
- Production API: `https://api.soulvan.ai`

### Backend Setup (Optional)
To run the backend services:

```bash
# Install Python dependencies
pip install -r services/nvidia-ai-engine/requirements.txt
pip install -r services/clip-provenance/requirements.txt
pip install -r services/dao-voting/requirements.txt

# Set NVIDIA API key
export NVIDIA_API_KEY="your_nvidia_api_key_here"

# Start services
python services/clip-provenance/server.py &   # Port 5200
python services/dao-voting/server.py &        # Port 5300
python services/nvidia-ai-engine/server.py &  # Port 5400
```

---

## 🔧 Troubleshooting

### Installation Issues

**"App not installed"**
- Check if you have enough storage space (~100 MB)
- Uninstall any previous version of Soulvan AI
- Restart your device and try again

**"Parse error"**
- Re-download the APK (file may be corrupted)
- Verify your Android version is 7.0+ (API 24+)

**"Blocked by Play Protect"**
- Tap **More details** → **Install anyway**
- The app is safe but unsigned by Google Play

### Runtime Issues

**"Cannot connect to services"**
- Check internet connection
- Verify backend services are running
- Update API endpoints in app settings

**App crashes on startup**
- Clear app cache: Settings → Apps → Soulvan AI → Clear cache
- Reinstall the app
- Check device has Android 7.0+

**Images not generating**
- Verify NVIDIA API key is configured on backend
- Check backend logs: `services/nvidia-ai-engine/server.py`
- Ensure sufficient credits in NVIDIA account

---

## 🔐 Security

### APK Signing
The APK is signed with a debug certificate for easy distribution. For production:

1. Generate production keystore:
   ```bash
   chmod +x scripts/generate-keystore.sh
   ./scripts/generate-keystore.sh
   ```

2. Update `android/app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           storeFile file("soulvan-release-key.keystore")
           storePassword "your_store_password"
           keyAlias "soulvan-ai"
           keyPassword "your_key_password"
       }
   }
   ```

### Private Key Storage
- Wallet private keys are stored encrypted on device
- Keys are excluded from backups (see `backup_rules.xml`)
- Never share your private keys or seed phrases

---

## 📊 System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Android Version | 7.0 (API 24) | 10.0+ (API 29) |
| RAM | 2 GB | 4 GB+ |
| Storage | 100 MB | 500 MB+ |
| Internet | 3G/4G | WiFi/5G |
| Screen | 720p | 1080p+ |

---

## 🆘 Support

### Report Issues
- GitHub Issues: [Create an issue](https://github.com/44547/soulvan-Ai-photo-and-video-generator/issues)
- Include: Android version, device model, error logs

### Get Logs
Enable developer mode and use ADB:
```bash
adb logcat | grep "SoulvanAI"
```

### Community
- Discord: [Join server] (TBD)
- Telegram: [Join group] (TBD)
- Twitter: [@SoulvanAI] (TBD)

---

## 🚀 Updates

The app will notify you of new versions. To update:

1. Download new APK from GitHub Releases
2. Install over existing app (data preserved)
3. Or uninstall old version first (data will be lost)

**Auto-update coming soon!**

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](../LICENSE) file.

---

## 🌟 Credits

Built with:
- **Kotlin** & **Jetpack Compose** - Modern Android UI
- **NVIDIA RTX** & **Picasso** - World-class rendering
- **Web3j** - Ethereum integration
- **Retrofit** - API networking
- **Material Design 3** - Beautiful UI

---

**Made with ❤️ by the Soulvan Community**

*Create. Render. Decentralize.*
