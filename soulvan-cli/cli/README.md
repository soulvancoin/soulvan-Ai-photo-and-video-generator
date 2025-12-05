# Soulvan CLI

Welcome to the Soulvan CLI project! This command-line interface is designed to facilitate the integration and management of cinematic scenes, wallet identity linking, and rendering processes for Unity projects.

## Project Structure

The Soulvan CLI project is organized as follows:

- **cli/**: Contains the core CLI application.
  - **bin/**: The entry point for the CLI.
  - **src/**: Source code for the CLI, including commands and services.
  - **package.json**: Configuration file for npm dependencies and scripts.
  - **tsconfig.json**: TypeScript configuration for compiling the CLI code.

- **unity/**: Contains Unity project files, including scenes and scripts for runtime and editor.
  - **Assets/**: Unity assets, including cinematic scenes and scripts.
  - **ProjectSettings/**: Unity project settings files.

- **integrations/**: Contains integration files for NVIDIA and Adobe workflows.
  - **nvidia/**: Configuration and scripts for NVIDIA rendering technologies.
  - **adobe/**: Configuration for Adobe export presets.

- **render-presets/**: Contains rendering profiles, including 8K rendering configurations.

- **tools/**: Scripts and configurations for packaging and development environments.

- **ci/**: Continuous Integration scripts and Docker configurations for automated builds and artifact publishing.

- **docs/**: Documentation files covering various aspects of the project, including cinematic pipelines and wallet identity linking.

- **samples/**: Sample configurations for cinematic projects and identity linking.

## Features

- **Cinematic Scene Management**: Easily manage and create cinematic scenes within Unity.
- **Wallet Identity Linking**: Link wallet identities to Unity projects for seamless integration.
- **8K Rendering**: Support for high-resolution rendering with dedicated profiles.
- **Adobe Workflow Exports**: Export Unity projects to Adobe workflows for further processing.
- **NVIDIA Integration**: Utilize NVIDIA accelerated renderers for enhanced performance.
- **CI/CD Support**: Automated packaging and artifact publishing through CI/CD pipelines.

## Getting Started

To get started with the Soulvan CLI, clone the repository and install the necessary dependencies:

```bash
git clone <repository-url>
cd soulvan-cli/cli
npm install
```

You can then run the CLI commands to manage your Unity projects effectively.

## Contributing

We welcome contributions to the Soulvan CLI project! Please refer to the documentation for guidelines on how to contribute.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.