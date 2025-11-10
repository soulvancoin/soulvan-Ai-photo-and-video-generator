# Adobe Workflow Integration for Soulvan CLI

This document outlines the integration of Adobe workflows within the Soulvan CLI project. The integration allows for seamless export of Unity projects to Adobe applications, facilitating enhanced creative workflows.

## Overview

The Adobe workflow integration is designed to streamline the process of exporting assets and scenes from Unity to Adobe software. This includes support for various Adobe applications, ensuring that users can easily transition their work between platforms.

## Export Process

1. **Command Execution**: The export process is initiated through the Soulvan CLI using the `export-adobe` command. This command triggers the necessary scripts to prepare the Unity project for export.

2. **Export Presets**: The integration utilizes predefined export presets located in the `integrations/adobe/export-presets` directory. These presets define the settings and configurations for different types of exports.

3. **File Formats**: The exported files can be in various formats compatible with Adobe applications, such as `.psd`, `.ai`, or other relevant formats depending on the project requirements.

4. **Automation**: The export process can be automated through CI/CD pipelines, allowing for regular updates and exports without manual intervention.

## Configuration

To configure the Adobe export settings, users can modify the `adobe-exports.json` file located in the `integrations/adobe/export-presets` directory. This file contains key-value pairs that define the export parameters, such as:

- **Resolution**: Specify the resolution of the exported assets.
- **File Type**: Define the type of file to be exported.
- **Layers**: Control the visibility of layers in the exported files.

## Usage

To use the Adobe export functionality, run the following command in the Soulvan CLI:

```bash
soulvan export-adobe --preset <preset-name>
```

Replace `<preset-name>` with the desired export preset defined in the `adobe-exports.json` file.

## Conclusion

The Adobe workflow integration within the Soulvan CLI enhances the creative capabilities of users by providing a robust solution for exporting Unity projects to Adobe applications. By following the outlined processes and configurations, users can efficiently manage their workflows and improve productivity.