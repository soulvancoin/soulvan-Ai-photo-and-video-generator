"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const adobeService_1 = require("../services/adobeService");
const program = new commander_1.Command();
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
        await (0, adobeService_1.exportToAdobe)(scene, output);
        console.log(`Exported ${scene} to ${output}`);
    }
    catch (error) {
        console.error('Error exporting to Adobe:', error);
    }
});
exports.default = program;
