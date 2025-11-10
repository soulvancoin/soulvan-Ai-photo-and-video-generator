#!/bin/bash

# Build the Soulvan package for distribution

# Set variables
PACKAGE_NAME="soulvan-cli"
BUILD_DIR="./build"
OUTPUT_DIR="./dist"
VERSION=$(cat ../cli/package.json | jq -r .version)

# Create build and output directories
mkdir -p $BUILD_DIR
mkdir -p $OUTPUT_DIR

# Copy necessary files to build directory
cp -r ../cli/bin $BUILD_DIR/
cp -r ../cli/src $BUILD_DIR/
cp ../cli/package.json $BUILD_DIR/
cp ../cli/tsconfig.json $BUILD_DIR/

# Build the CLI
cd $BUILD_DIR
npm install
npm run build

# Package the build
cd $OUTPUT_DIR
tar -czf ${PACKAGE_NAME}-${VERSION}.tar.gz -C $BUILD_DIR .

# Clean up
rm -rf $BUILD_DIR

echo "Package ${PACKAGE_NAME}-${VERSION} built successfully and stored in ${OUTPUT_DIR}"