"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNvidiaRenderProfile = exports.setNvidiaRenderSettings = exports.checkNvidiaDriver = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function checkNvidiaDriver() {
    try {
        const { stdout } = await execAsync('nvidia-smi');
        return stdout;
    }
    catch (error) {
        throw new Error('NVIDIA driver not found or not installed.');
    }
}
exports.checkNvidiaDriver = checkNvidiaDriver;
async function setNvidiaRenderSettings(settings) {
    try {
        // Assuming settings is a JSON object that needs to be applied
        const command = `nvidia-settings -a ${JSON.stringify(settings)}`;
        await execAsync(command);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error('Failed to set NVIDIA render settings: ' + message);
    }
}
exports.setNvidiaRenderSettings = setNvidiaRenderSettings;
async function getNvidiaRenderProfile() {
    try {
        const { stdout } = await execAsync('cat /path/to/nvidia-rtx-profile.json');
        return JSON.parse(stdout);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error('Failed to retrieve NVIDIA render profile: ' + message);
    }
}
exports.getNvidiaRenderProfile = getNvidiaRenderProfile;
