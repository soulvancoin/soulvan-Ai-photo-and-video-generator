"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRun = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function jobRun(configPath, options) {
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
    const unityProcess = (0, child_process_1.spawn)(unityBin, args, { stdio: 'inherit' });
    return new Promise((resolve, reject) => {
        unityProcess.on('exit', (code) => {
            if (code === 0) {
                console.log('Unity job completed successfully.');
                resolve();
            }
            else {
                console.error(`Unity job failed with exit code ${code}`);
                reject(new Error(`Unity exited with code ${code}`));
            }
        });
        unityProcess.on('error', (err) => {
            console.error('Failed to start Unity process:', err);
            reject(err);
        });
    });
}
exports.jobRun = jobRun;
