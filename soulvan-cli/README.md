# Soulvan CLI

Welcome to the Soulvan CLI project! This command-line interface is designed to facilitate the integration of Unity projects with wallet identity linking, cinematic scene management, and advanced rendering capabilities.

## Project Structure

The Soulvan CLI project is organized as follows:

```
soulvan-cli
├── cli                   # CLI application
│   ├── bin               # CLI entry point
│   ├── package.json      # NPM configuration
│   ├── tsconfig.json     # TypeScript configuration
│   └── src               # Source code
│       ├── index.ts      # Main entry point
│       ├── commands      # Command implementations
│       └── services      # Service functions
├── unity                 # Unity project files
├── integrations           # Integration scripts and configurations
├── render-presets        # Rendering presets
├── tools                 # Utility scripts
├── ci                    # CI/CD scripts and configurations
├── .github               # GitHub workflows
├── docs                  # Documentation
├── samples               # Sample projects
├── scripts               # Utility scripts
├── .gitignore            # Git ignore file
├── LICENSE               # License information
└── README.md             # Main project documentation
```

## Features

- **Cinematic Scenes**: Easily manage and create cinematic scenes within Unity.
- **Wallet Identity Linking**: Link wallet identities to Unity projects for seamless integration.
- **8K Rendering**: Support for high-resolution rendering with 8K profiles.
- **Adobe Workflow Exports**: Export Unity projects to Adobe workflows for enhanced productivity.
- **NVIDIA Integration**: Utilize NVIDIA accelerated renderers for optimal performance.
- **CI/CD**: Automated packaging and artifact publishing through continuous integration and deployment.

## Getting Started

To get started with the Soulvan CLI, clone the repository and install the necessary dependencies:

```bash
git clone <repository-url>
cd soulvan-cli/cli
npm install
```

You can then run the CLI commands to link wallets, render scenes, and export projects.

## Documentation

For detailed documentation on each feature, please refer to the following files:

- [Overview](docs/OVERVIEW.md)
- [Cinematic Pipeline](docs/CINEMATIC_PIPELINE.md)
- [Batch Export & Job Runner Workflow](docs/BATCH_EXPORT_WORKFLOW.md) ⭐ **New**
- [Wallet Identity](docs/WALLET_IDENTITY.md)
- [Rendering 8K](docs/RENDERING_8K.md)
- [Adobe Workflow](docs/ADOBE_WORKFLOW.md)

## Quick Start

### Install Dependencies

```bash
cd soulvan-cli/cli
npm install
```

### Link Your Wallet

```bash
npx ts-node src/index.ts link-wallet 0xYourWalletAddress
```

### Run a Headless Unity Job

```bash
npx ts-node src/index.ts job:run samples/sample-job-config.json
```

### Start CLIP Provenance Service

```bash
cd services/clip-provenance
pip install -r requirements.txt
python server.py
```

See [Batch Export Workflow](docs/BATCH_EXPORT_WORKFLOW.md) for complete usage examples.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.