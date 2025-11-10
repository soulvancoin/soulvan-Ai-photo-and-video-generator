# CINEMATIC PIPELINE

## Overview
The cinematic pipeline for the Soulvan CLI is designed to streamline the creation, rendering, and export of cinematic scenes within Unity. This document outlines the steps and components involved in the pipeline, ensuring a smooth workflow from scene creation to final output.

## Components
1. **Cinematic Scenes**: 
   - The primary scenes are located in the `unity/Assets/Scenes/cinematic` directory.
   - `cinematic_main.unity`: The main cinematic scene containing the core elements of the cinematic experience.
   - `cinematic_template.unity`: A template scene that can be duplicated and modified for new cinematic projects.

2. **Rendering**:
   - The rendering process is managed through the CLI command `render.ts`, which triggers the rendering of the specified cinematic scene.
   - Integration with NVIDIA accelerated renderers is facilitated through the `nvidia` integration, ensuring high-quality output.

3. **8K Rendering**:
   - The project supports 8K rendering through specific profiles defined in `render-presets/8k/8k-render-profile.json`.
   - Ensure that your rendering settings are configured to utilize the 8K profile for optimal output.

4. **Adobe Workflow Exports**:
   - The export process to Adobe workflows is handled by the `export-adobe.ts` command.
   - Export presets are defined in `integrations/adobe/export-presets/adobe-exports.json`, allowing for seamless integration with Adobe tools.

5. **CI/CD Integration**:
   - The CI/CD pipeline is set up to automate the packaging and publishing of cinematic projects.
   - Scripts for building and publishing artifacts are located in the `ci/scripts` directory, with workflows defined in `.github/workflows`.

## Workflow Steps
1. **Create a New Cinematic Scene**:
   - Duplicate `cinematic_template.unity` and modify it as needed.
   - Add necessary assets and configure scene settings.

2. **Render the Scene**:
   - Use the CLI command to render the scene:
     ```
     ./cli/bin/soulvan render <scene-path>
     ```

3. **Export to Adobe**:
   - After rendering, export the project to Adobe using:
     ```
     ./cli/bin/soulvan export-adobe <scene-path>
     ```

4. **Automate with CI/CD**:
   - Trigger the CI pipeline to build and publish the cinematic project:
     ```
     ./ci/scripts/ci-build.sh
     ./ci/scripts/publish-artifacts.sh
     ```

## Conclusion
The cinematic pipeline for Soulvan CLI provides a comprehensive framework for creating, rendering, and exporting cinematic scenes. By following the outlined steps and utilizing the provided tools, users can efficiently manage their cinematic projects within Unity.