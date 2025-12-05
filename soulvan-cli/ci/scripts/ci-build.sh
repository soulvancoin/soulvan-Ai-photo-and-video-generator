#!/bin/bash

# Set the environment for the build
export NODE_ENV=production

# Navigate to the CLI directory
cd "$(dirname "$0")/../../cli"

# Install dependencies
npm install

# Build the TypeScript files
npm run build

# Run tests
npm test

# Package the application
npm run package

# Notify completion
echo "CI build completed successfully."