import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export async function jobRun(configPath: string, options: { unityPath?: string; projectPath?: string }) {
  const unityBin = options.unityPath || process.env.UNITY_BIN || '/opt/Unity/Editor/Unity';
  const projectPath = options.projectPath || path.resolve(process.cwd(), 'soulvan-cli/unity');
  
  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    process.exit(1);
  }

  const absoluteConfigPath = path.resolve(configPath);
  
  console.log(`Running Unity job with config: ${absoluteConfigPath}`);
  console.log(`Unity binary: ${unityBin}`);
  console.log(`Project path: ${projectPath}`);

  const args = [
    '-batchmode',
    '-nographics',
    '-projectPath', projectPath,
    '-executeMethod', 'SoulvanJobRunner.Run',
    '--config', absoluteConfigPath,
    '-quit'
  ];

  const unityProcess = spawn(unityBin, args, { stdio: 'inherit' });

  return new Promise<void>((resolve, reject) => {
    unityProcess.on('exit', (code: number | null) => {
      if (code === 0) {
        console.log('Unity job completed successfully.');
        resolve();
      } else {
        console.error(`Unity job failed with exit code ${code}`);
        reject(new Error(`Unity exited with code ${code}`));
      }
    });

    unityProcess.on('error', (err: Error) => {
      console.error('Failed to start Unity process:', err);
      reject(err);
    });
  });
}
