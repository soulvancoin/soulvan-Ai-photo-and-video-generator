import { Command } from 'commander';
import { buildPackage } from '../services/packaging';

const program = new Command();

program
  .command('package')
  .description('Package the Unity project for distribution')
  .option('-p, --project <path>', 'Path to Unity project', '.')
  .action(async (options) => {
    try {
      await buildPackage(options.project);
      console.log('Packaging process completed successfully.');
    } catch (error) {
      console.error('Error during packaging:', error);
    }
  });

export default program;