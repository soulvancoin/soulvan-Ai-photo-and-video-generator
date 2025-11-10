#!/bin/bash

# This script configures NVIDIA rendering settings for the Soulvan CLI project.

# Check if NVIDIA driver is installed
if ! command -v nvidia-smi &> /dev/null
then
    echo "NVIDIA driver is not installed. Please install it to use this script."
    exit 1
fi

# Set up NVIDIA rendering settings
echo "Configuring NVIDIA rendering settings..."

# Example configuration commands (customize as needed)
nvidia-settings -a [gpu:0]/GPUPowerMizerMode=1
nvidia-settings -a [gpu:0]/GPUGraphicsClockOffset[3]=100
nvidia-settings -a [gpu:0]/GPUFanControlState=1
nvidia-settings -a [fan:0]/GPUTargetFanSpeed=80

echo "NVIDIA rendering settings configured successfully."