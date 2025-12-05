"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const program = new commander_1.Command();
program
    .name('soulvan')
    .description('CLI for managing Soulvan projects')
    .version('1.0.0');
// Commands are defined inline here
program
    .command('link-wallet <address>')
    .description('Link a wallet address to a Unity project')
    .action(async (address) => {
    const { WalletService } = await Promise.resolve().then(() => __importStar(require('./services/wallet')));
    const walletService = new WalletService();
    walletService.linkWallet(address);
});
program
    .command('render')
    .description('Trigger the rendering process for a Unity project')
    .option('-p, --project <path>', 'Path to the Unity project')
    .option('-r, --resolution <resolution>', 'Resolution for rendering (e.g., 8k)')
    .action(async (options) => {
    const { RendererService } = await Promise.resolve().then(() => __importStar(require('./services/renderer')));
    const renderer = new RendererService(options.resolution || '8k');
    if (options.project) {
        await renderer.startRendering(options.project);
    }
    else {
        console.error('Project path is required');
    }
});
program
    .command('export-adobe')
    .description('Export Unity project to Adobe workflows')
    .option('-s, --scene <path>', 'Scene path to export')
    .option('-o, --output <path>', 'Output path for Adobe export')
    .action(async (options) => {
    if (!options.scene || !options.output) {
        console.error('Both scene and output paths are required');
        return;
    }
    const { RendererService } = await Promise.resolve().then(() => __importStar(require('./services/renderer')));
    const renderer = new RendererService('default');
    await renderer.exportToAdobe(options.scene, options.output);
});
program
    .command('package')
    .description('Package the Unity project for distribution')
    .action(async () => {
    console.log('Package command not yet implemented.');
});
program
    .command('job:run <configPath>')
    .description('Run headless Unity job with JSON config')
    .option('-u, --unity-path <path>', 'Path to Unity editor binary')
    .option('-p, --project-path <path>', 'Path to Unity project directory')
    .action(async (configPath, options) => {
    const { jobRun } = await Promise.resolve().then(() => __importStar(require('./commands/job-run')));
    await jobRun(configPath, options);
});
program.parse(process.argv);
