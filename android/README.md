# Android APK Build System

This directory contains the complete Android application for **Soulvan AI** - a world-class AI photo and video generation platform.

## 📱 App Features

- **AI Image Generation** - Create photorealistic images with NVIDIA Picasso
- **RTX Video Rendering** - Ultra-realistic rendering with DLSS 3.5 and Ray Tracing
- **Crypto Wallet** - Manage Ethereum wallet and Soulvan tokens
- **DAO Voting** - Participate in platform governance
- **Modern UI** - Built with Jetpack Compose and Material Design 3

## 🏗️ Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/soulvan/ai/
│   │   │   ├── MainActivity.kt              # Main entry point
│   │   │   ├── SoulvanApplication.kt        # Application class
│   │   │   ├── ui/theme/                    # Theme & styling
│   │   │   └── ui/screens/                  # Screen composables
│   │   │       ├── HomeScreen.kt            # Dashboard
│   │   │       ├── GenerateScreen.kt        # Image generation
│   │   │       ├── RenderScreen.kt          # Video rendering
│   │   │       ├── WalletScreen.kt          # Crypto wallet
│   │   │       └── VotingScreen.kt          # DAO voting
│   │   ├── res/                             # Resources
│   │   └── AndroidManifest.xml              # App manifest
│   ├── build.gradle                         # App build config
│   └── proguard-rules.pro                   # ProGuard rules
├── build.gradle                              # Project build config
├── settings.gradle                           # Project settings
└── gradle.properties                         # Gradle properties
```

## 🛠️ Build Requirements

- **JDK 17** or higher
- **Android SDK** with API level 34
- **Gradle 8.6** (via wrapper)
- **Android Studio** Hedgehog or higher (optional)

## 📦 Building the APK

### Option 1: Using Build Script (Recommended)
```bash
# From project root
./scripts/build-apk.sh

# APK will be generated at: build/apk/SoulvanAI-v1.0.0.apk
```

### Option 2: Using Gradle
```bash
cd android

# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Find APK at: app/build/outputs/apk/release/app-release.apk
```

### Option 3: Using Android Studio
1. Open `android/` folder in Android Studio
2. Select **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Click **locate** in the notification to find the APK

## 🔐 Signing Configuration

### Generate Keystore
```bash
./scripts/generate-keystore.sh
```

This creates `android/app/soulvan-release-key.keystore` with default credentials:
- **Keystore password:** `soulvan2025`
- **Key alias:** `soulvan-ai`
- **Key password:** `soulvan2025`

⚠️ **Change these for production use!**

### Configure Signing
Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('soulvan-release-key.keystore')
            storePassword 'your_password'
            keyAlias 'soulvan-ai'
            keyPassword 'your_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

## 🚀 GitHub Actions CI/CD

Every push to `main` automatically builds an APK via GitHub Actions:

**.github/workflows/build-apk.yml**
- Builds release APK
- Signs APK (if secrets configured)
- Uploads as artifact (30-day retention)
- Creates GitHub Release on version tags

### Setup Signing in GitHub
Add these secrets in **Settings → Secrets and variables → Actions**:

```bash
SIGNING_KEY=$(base64 -w 0 android/app/soulvan-release-key.keystore)
ALIAS=soulvan-ai
KEY_STORE_PASSWORD=your_password
KEY_PASSWORD=your_password
```

## 📲 Installation

See [docs/APK_DOWNLOAD.md](../docs/APK_DOWNLOAD.md) for complete installation guide.

**Quick start:**
1. Enable "Install from unknown sources" on Android device
2. Download APK from GitHub Releases
3. Install and grant permissions
4. Launch Soulvan AI app

## 🎨 Technology Stack

| Component | Technology |
|-----------|------------|
| Language | Kotlin 1.9.22 |
| UI Framework | Jetpack Compose |
| Design System | Material Design 3 |
| Architecture | MVVM |
| Networking | Retrofit 2.9 + OkHttp 4.12 |
| Image Loading | Coil 2.5 |
| Blockchain | Web3j 4.10 |
| Min SDK | 24 (Android 7.0) |
| Target SDK | 34 (Android 14) |

## 🔌 API Integration

The app connects to these backend services:

| Service | Port | Purpose |
|---------|------|---------|
| CLIP Provenance | 5200 | Originality detection |
| DAO Voting | 5300 | Governance voting |
| NVIDIA AI Engine | 5400 | Image/video generation |

**Development endpoints:** `http://10.0.2.2:PORT` (Android emulator)  
**Production endpoint:** `https://api.soulvan.ai`

Configure in `SoulvanApplication.kt`

## 🧪 Testing

```bash
# Run unit tests
./gradlew test

# Run instrumented tests (requires device/emulator)
./gradlew connectedAndroidTest

# Generate test coverage report
./gradlew jacocoTestReport
```

## 📊 APK Size Optimization

Current optimizations enabled:
- **ProGuard** code shrinking and obfuscation
- **Resource shrinking** removes unused resources
- **Native libs** filtered by ABI (armeabi-v7a, arm64-v8a, x86, x86_64)
- **Vector drawables** instead of PNG icons

Expected APK size: **~25 MB** (release)

## 🐛 Debugging

### View Logs
```bash
# All app logs
adb logcat | grep "SoulvanAI"

# Crash logs only
adb logcat | grep "AndroidRuntime"
```

### Connect to Backend (Development)
```bash
# Forward emulator port to host
adb reverse tcp:5200 tcp:5200
adb reverse tcp:5300 tcp:5300
adb reverse tcp:5400 tcp:5400
```

## 📝 Code Style

This project follows **Kotlin Coding Conventions**:
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- 4-space indentation
- Line length: 120 characters max

Format code: **Code → Reformat Code** (Ctrl+Alt+L)

## 🔄 Versioning

Version format: `MAJOR.MINOR.PATCH` (Semantic Versioning)

Update version:
1. Edit `android/app/build.gradle`:
   ```gradle
   defaultConfig {
       versionCode 2        // Increment for each release
       versionName "1.1.0"  // Update version string
   }
   ```

2. Create git tag:
   ```bash
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin v1.1.0
   ```

## 📄 License

MIT License - see [LICENSE](../LICENSE)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/44547/soulvan-Ai-photo-and-video-generator/issues)
- **Documentation:** [docs/APK_DOWNLOAD.md](../docs/APK_DOWNLOAD.md)

---

**Built with ❤️ by the Soulvan Community**
