"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const renderer_1 = require("../services/renderer");
const program = new commander_1.Command();
program
    .command('render')
    .description('Trigger the rendering process for a Unity project')
    .option('-p, --project <path>', 'Path to the Unity project')
    .option('-r, --resolution <resolution>', 'Resolution for rendering (e.g., 8k)')
    .action(async (options) => {
    const { project, resolution } = options;
    try {
        const renderer = new renderer_1.RendererService(resolution || '8k');
        if (project) {
            await renderer.startRendering(project);
        }
        else {
            console.error('Project path is required');
        }
    }
    catch (error) {
        console.error('Error during rendering:', error);
    }
});
exports.default = program;
