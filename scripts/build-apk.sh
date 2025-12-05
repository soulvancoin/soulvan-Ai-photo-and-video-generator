#!/bin/bash
# Build script for Soulvan AI Android APK

set -e

echo "🚀 Building Soulvan AI Android APK..."

# Navigate to android directory
cd "$(dirname "$0")/.."
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release APK
echo "📦 Building release APK..."
./gradlew assembleRelease

# Copy APK to output directory
OUTPUT_DIR="../build/apk"
mkdir -p "$OUTPUT_DIR"

APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    cp "$APK_PATH" "$OUTPUT_DIR/SoulvanAI-v1.0.0.apk"
    echo "✅ APK built successfully!"
    echo "📱 Location: $OUTPUT_DIR/SoulvanAI-v1.0.0.apk"
    
    # Show APK size
    SIZE=$(du -h "$OUTPUT_DIR/SoulvanAI-v1.0.0.apk" | cut -f1)
    echo "📊 Size: $SIZE"
else
    echo "❌ APK not found at $APK_PATH"
    exit 1
fi
