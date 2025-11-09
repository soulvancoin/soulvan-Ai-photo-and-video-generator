import { Command } from 'commander';
import { exportToAdobe } from '../services/adobeService';

const program = new Command();

program
  .command('export-adobe')
  .description('Export Unity project to Adobe workflows')
  .option('-s, --scene <path>', 'Scene path')
  .option('-o, --output <path>', 'Output path')
  .action(async (options) => {
    const { scene, output } = options;
    try {
      if (!scene || !output) {
        console.error('Both scene and output paths are required');
        return;
      }
      await exportToAdobe(scene, output);
      console.log(`Exported ${scene} to ${output}`);
    } catch (error) {
      console.error('Error exporting to Adobe:', error);
    }
  });

export default program;