"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const packaging_1 = require("../services/packaging");
const program = new commander_1.Command();
program
    .command('package')
    .description('Package the Unity project for distribution')
    .option('-p, --project <path>', 'Path to Unity project', '.')
    .action(async (options) => {
    try {
        await (0, packaging_1.buildPackage)(options.project);
        console.log('Packaging process completed successfully.');
    }
    catch (error) {
        console.error('Error during packaging:', error);
    }
});
exports.default = program;
