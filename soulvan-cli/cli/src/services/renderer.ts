import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class RendererService {
    private renderProfile: string;

    constructor(renderProfile: string) {
        this.renderProfile = renderProfile;
    }

    public async startRendering(scenePath: string): Promise<void> {
        try {
            const command = this.buildRenderCommand(scenePath);
            console.log(`Starting rendering with command: ${command}`);
            await execAsync(command);
            console.log('Rendering completed successfully.');
        } catch (error) {
            console.error('Error during rendering:', error);
        }
    }

    private buildRenderCommand(scenePath: string): string {
        return `unity -batchmode -quit -executeMethod RenderPipeline.Render ${scenePath} -profile ${this.renderProfile}`;
    }

    public async exportToAdobe(scenePath: string, exportPath: string): Promise<void> {
        try {
            const command = `unity -batchmode -quit -executeMethod AdobeExportPipeline.Export ${scenePath} ${exportPath}`;
            console.log(`Exporting to Adobe with command: ${command}`);
            await execAsync(command);
            console.log('Export to Adobe completed successfully.');
        } catch (error) {
            console.error('Error during Adobe export:', error);
        }
    }
}