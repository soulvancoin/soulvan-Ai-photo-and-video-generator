#!/bin/bash

# This script synchronizes Unity scenes between the local project and the Unity editor.

UNITY_PROJECT_PATH="../unity"
SCENES_DIR="$UNITY_PROJECT_PATH/Assets/Scenes"

# Check if Unity project path exists
if [ ! -d "$UNITY_PROJECT_PATH" ]; then
  echo "Unity project path does not exist: $UNITY_PROJECT_PATH"
  exit 1
fi

# Sync cinematic scenes
echo "Syncing cinematic scenes..."
rsync -av --delete "$SCENES_DIR/cinematic/" "$SCENES_DIR/cinematic_backup/"

# Sync staging scenes
echo "Syncing staging scenes..."
rsync -av --delete "$SCENES_DIR/staging/" "$SCENES_DIR/staging_backup/"

echo "Scene synchronization completed."