#!/bin/bash

# This script publishes artifacts to the designated store.

set -e

# Define variables
ARTIFACTS_DIR="./artifacts"
PUBLISH_URL="https://example.com/publish"  # Replace with actual publish URL
VERSION=$(cat ../cli/package.json | jq -r .version)

# Create artifacts directory if it doesn't exist
mkdir -p $ARTIFACTS_DIR

# Build the project (assuming there's a build script)
echo "Building the project..."
bash ./ci/scripts/ci-build.sh

# Move built artifacts to the artifacts directory
echo "Moving built artifacts to $ARTIFACTS_DIR..."
mv ./build/* $ARTIFACTS_DIR/

# Publish artifacts
echo "Publishing artifacts to $PUBLISH_URL..."
curl -X POST -F "version=$VERSION" -F "artifacts=@$ARTIFACTS_DIR/*" $PUBLISH_URL

echo "Artifacts published successfully."