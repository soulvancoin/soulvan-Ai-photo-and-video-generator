#!/usr/bin/env node
"use strict";
/**
 * voicecapture - CLI tool for recording and uploading contributor voiceovers
 * Part of Soulvan AI Mythic Loop System
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureAndSubmit = exports.submitToBlockchain = exports.uploadToIPFS = exports.recordLine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const VOICE_API_URL = process.env.VOICE_API_URL || 'http://localhost:5600/api/voice-vote';
const IPFS_UPLOAD_URL = process.env.IPFS_UPLOAD_URL || 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
/**
 * Record voice line using system microphone
 */
async function recordLine(character, line, outputPath) {
    console.log(`🎙️  Recording voiceover for ${character}: "${line}"`);
    console.log('📢 Press ENTER when ready to start recording...');
    // Wait for user input
    await waitForEnter();
    const filename = outputPath || `${character.replace(/\s+/g, '_')}_${Date.now()}.wav`;
    const filepath = path_1.default.join(process.cwd(), filename);
    console.log('🔴 Recording... (Press Ctrl+C when done)');
    try {
        // Use system audio recording (platform-specific)
        if (process.platform === 'darwin') {
            // macOS: use sox
            await execAsync(`sox -d ${filepath} trim 0 30`);
        }
        else if (process.platform === 'linux') {
            // Linux: use arecord
            await execAsync(`arecord -f cd -t wav -d 30 ${filepath}`);
        }
        else if (process.platform === 'win32') {
            // Windows: use PowerShell
            await execAsync(`powershell -Command "Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.SetOutputToWaveFile('${filepath}'); $synth.Speak('Recording...'); $synth.Dispose()"`);
        }
        console.log(`✅ Recording saved to: ${filepath}`);
        return filepath;
    }
    catch (error) {
        console.error('❌ Recording failed:', error);
        throw error;
    }
}
exports.recordLine = recordLine;
/**
 * Upload audio file to IPFS via Pinata
 */
async function uploadToIPFS(filepath) {
    console.log(`📤 Uploading to IPFS: ${filepath}`);
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        console.warn('⚠️  IPFS credentials not configured. Upload manually to IPFS.');
        return `file://${filepath}`;
    }
    try {
        const formData = new form_data_1.default();
        formData.append('file', fs_1.default.createReadStream(filepath));
        const response = await axios_1.default.post(IPFS_UPLOAD_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });
        const ipfsHash = response.data.IpfsHash;
        const ipfsUrl = `ipfs://${ipfsHash}`;
        console.log(`✅ Uploaded to IPFS: ${ipfsUrl}`);
        return ipfsUrl;
    }
    catch (error) {
        console.error('❌ IPFS upload failed:', error);
        throw error;
    }
}
exports.uploadToIPFS = uploadToIPFS;
/**
 * Submit voice clip to blockchain
 */
async function submitToBlockchain(character, zone, audioUrl, duration) {
    console.log(`📝 Submitting to blockchain...`);
    try {
        const response = await axios_1.default.post(`${VOICE_API_URL}/clips/register`, {
            character,
            zone,
            url: audioUrl,
            duration
        });
        console.log(`✅ Registered on blockchain! Clip ID: ${response.data.clipId}`);
    }
    catch (error) {
        console.error('❌ Blockchain submission failed:', error);
        throw error;
    }
}
exports.submitToBlockchain = submitToBlockchain;
/**
 * Get audio file duration
 */
async function getAudioDuration(filepath) {
    try {
        const { stdout } = await execAsync(`ffprobe -i ${filepath} -show_entries format=duration -v quiet -of csv="p=0"`);
        return parseFloat(stdout.trim());
    }
    catch (error) {
        console.warn('⚠️  Could not detect audio duration, using default 10s');
        return 10;
    }
}
/**
 * Wait for user to press ENTER
 */
function waitForEnter() {
    return new Promise((resolve) => {
        process.stdin.once('data', () => resolve());
    });
}
/**
 * Complete voice capture workflow
 */
async function captureAndSubmit(character, line, zone) {
    console.log('\n🎤 Soulvan Voice Capture Tool\n');
    console.log(`Character: ${character}`);
    console.log(`Line: "${line}"`);
    console.log(`Zone: ${zone}\n`);
    try {
        // Record audio
        const audioFile = await recordLine(character, line);
        // Get duration
        const duration = await getAudioDuration(audioFile);
        console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
        // Upload to IPFS
        const ipfsUrl = await uploadToIPFS(audioFile);
        // Submit to blockchain
        await submitToBlockchain(character, zone, ipfsUrl, duration);
        console.log('\n✨ Voice capture complete!');
        console.log(`🎙️  Your voiceover is now part of Soulvan lore!`);
    }
    catch (error) {
        console.error('\n💥 Voice capture failed:', error);
        process.exit(1);
    }
}
exports.captureAndSubmit = captureAndSubmit;
/**
 * CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('📋 Usage: voicecapture <character> <zone> "<line>"');
        console.log('\nExamples:');
        console.log('  voicecapture "Neon Reaper" NeonDistrict "The streets remember everything"');
        console.log('  voicecapture "Zone Commander" IndustrialBay "All units, sector 7 breach"\n');
        process.exit(1);
    }
    const [character, zone, line] = args;
    await captureAndSubmit(character, line, zone);
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
