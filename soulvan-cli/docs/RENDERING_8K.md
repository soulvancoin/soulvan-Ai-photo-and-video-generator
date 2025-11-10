# RENDERING 8K

## Overview
This document outlines the process and considerations for rendering cinematic scenes in 8K resolution using the Soulvan CLI and Unity. It covers the necessary configurations, rendering settings, and integration with NVIDIA accelerated renderers.

## Prerequisites
- Ensure you have the latest version of Unity installed.
- Install the Soulvan CLI by following the instructions in the [README.md](../README.md).
- Make sure you have NVIDIA graphics drivers installed for optimal rendering performance.

## Configuration
To enable 8K rendering, you need to configure the render settings in Unity and the Soulvan CLI. Follow these steps:

1. **Unity Render Settings**:
   - Open your Unity project.
   - Navigate to `Edit > Project Settings > Player`.
   - Set the resolution to 7680 x 4320 (8K).
   - Adjust the quality settings to ensure optimal performance.

2. **Soulvan CLI Render Profile**:
   - Use the provided 8K render profile located at `render-presets/8k/8k-render-profile.json`.
   - Ensure that the profile is correctly referenced in your rendering commands.

## Rendering Process
To initiate the rendering process for an 8K scene, use the following command in the Soulvan CLI:

```bash
soulvan render --profile 8k
```

This command will trigger the rendering process using the specified 8K render profile.

## Integration with NVIDIA Renderers
For enhanced performance, integrate with NVIDIA accelerated renderers. Ensure that your NVIDIA settings are configured correctly:

- Use the `adapter.sh` script located in `integrations/nvidia/` to set up the NVIDIA rendering environment.
- Verify that the `nvidia-rtx-profile.json` is configured for optimal 8K rendering.

## Exporting to Adobe Workflows
After rendering, you can export your scenes to Adobe workflows. Use the following command:

```bash
soulvan export-adobe --scene <scene_name>
```

Replace `<scene_name>` with the name of your rendered scene.

## Conclusion
Rendering in 8K requires careful configuration of both Unity and the Soulvan CLI. By following the steps outlined in this document, you can achieve high-quality cinematic scenes ready for export and further processing. For additional information, refer to the other documentation files in the `docs` directory.