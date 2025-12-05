#!/usr/bin/env bash
set -euo pipefail

CONFIG="$1"
UNITY_BIN="${UNITY_BIN:-/opt/Unity/Editor/Unity}"

if [ ! -f "$CONFIG" ]; then
  echo "Config file not found: $CONFIG" >&2
  exit 1
fi

echo "Running Unity job with config: $CONFIG"
echo "Unity binary: $UNITY_BIN"

"$UNITY_BIN" \
  -batchmode \
  -nographics \
  -projectPath "$(pwd)/soulvan-cli/unity" \
  -executeMethod SoulvanJobRunner.Run \
  --config "$CONFIG" \
  -quit

echo "Unity job completed."
