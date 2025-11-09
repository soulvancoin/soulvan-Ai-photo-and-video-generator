import { Command } from 'commander';

const program = new Command();

program
  .name('soulvan')
  .description('CLI for managing Soulvan projects')
  .version('1.0.0');

// Commands are defined inline here
program
  .command('link-wallet <address>')
  .description('Link a wallet address to a Unity project')
  .action(async (address: string) => {
    const { WalletService } = await import('./services/wallet');
    const walletService = new WalletService();
    walletService.linkWallet(address);
  });

program
  .command('render')
  .description('Trigger the rendering process for a Unity project')
  .option('-p, --project <path>', 'Path to the Unity project')
  .option('-r, --resolution <resolution>', 'Resolution for rendering (e.g., 8k)')
  .action(async (options: { project?: string; resolution?: string }) => {
    const { RendererService } = await import('./services/renderer');
    const renderer = new RendererService(options.resolution || '8k');
    if (options.project) {
      await renderer.startRendering(options.project);
    } else {
      console.error('Project path is required');
    }
  });

program
  .command('export-adobe')
  .description('Export Unity project to Adobe workflows')
  .option('-s, --scene <path>', 'Scene path to export')
  .option('-o, --output <path>', 'Output path for Adobe export')
  .action(async (options: { scene?: string; output?: string }) => {
    if (!options.scene || !options.output) {
      console.error('Both scene and output paths are required');
      return;
    }
    const { RendererService } = await import('./services/renderer');
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
  .action(async (configPath: string, options: { unityPath?: string; projectPath?: string }) => {
    const { jobRun } = await import('./commands/job-run');
    await jobRun(configPath, options);
  });

program.parse(process.argv);