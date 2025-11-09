import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function checkNvidiaDriver() {
    try {
        const { stdout } = await execAsync('nvidia-smi');
        return stdout;
    } catch (error) {
        throw new Error('NVIDIA driver not found or not installed.');
    }
}

export async function setNvidiaRenderSettings(settings: any) {
    try {
        // Assuming settings is a JSON object that needs to be applied
        const command = `nvidia-settings -a ${JSON.stringify(settings)}`;
        await execAsync(command);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error('Failed to set NVIDIA render settings: ' + message);
    }
}

export async function getNvidiaRenderProfile() {
    try {
        const { stdout } = await execAsync('cat /path/to/nvidia-rtx-profile.json');
        return JSON.parse(stdout);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error('Failed to retrieve NVIDIA render profile: ' + message);
    }
}