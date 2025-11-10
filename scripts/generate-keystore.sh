#!/bin/bash
# Generate Android keystore for APK signing

set -e

KEYSTORE_PATH="android/app/soulvan-release-key.keystore"
ALIAS="soulvan-ai"

echo "🔐 Generating Android keystore..."

# Check if keystore already exists
if [ -f "$KEYSTORE_PATH" ]; then
    echo "⚠️  Keystore already exists at $KEYSTORE_PATH"
    read -p "Overwrite? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
    rm "$KEYSTORE_PATH"
fi

# Generate keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -alias "$ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass soulvan2025 \
    -keypass soulvan2025 \
    -dname "CN=Soulvan AI, OU=Development, O=Soulvan, L=San Francisco, ST=CA, C=US"

echo "✅ Keystore generated successfully!"
echo "📍 Location: $KEYSTORE_PATH"
echo "🔑 Alias: $ALIAS"
echo ""
echo "⚠️  IMPORTANT: For production use, change the passwords!"
echo "Store these credentials securely:"
echo "  - Keystore password: soulvan2025"
echo "  - Key password: soulvan2025"
echo ""
echo "For GitHub Actions, add these secrets:"
echo "  SIGNING_KEY: $(base64 -w 0 $KEYSTORE_PATH 2>/dev/null || base64 -i $KEYSTORE_PATH)"
echo "  ALIAS: $ALIAS"
echo "  KEY_STORE_PASSWORD: soulvan2025"
echo "  KEY_PASSWORD: soulvan2025"
