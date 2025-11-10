"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RendererService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class RendererService {
    constructor(renderProfile) {
        this.renderProfile = renderProfile;
    }
    async startRendering(scenePath) {
        try {
            const command = this.buildRenderCommand(scenePath);
            console.log(`Starting rendering with command: ${command}`);
            await execAsync(command);
            console.log('Rendering completed successfully.');
        }
        catch (error) {
            console.error('Error during rendering:', error);
        }
    }
    buildRenderCommand(scenePath) {
        return `unity -batchmode -quit -executeMethod RenderPipeline.Render ${scenePath} -profile ${this.renderProfile}`;
    }
    async exportToAdobe(scenePath, exportPath) {
        try {
            const command = `unity -batchmode -quit -executeMethod AdobeExportPipeline.Export ${scenePath} ${exportPath}`;
            console.log(`Exporting to Adobe with command: ${command}`);
            await execAsync(command);
            console.log('Export to Adobe completed successfully.');
        }
        catch (error) {
            console.error('Error during Adobe export:', error);
        }
    }
}
exports.RendererService = RendererService;
