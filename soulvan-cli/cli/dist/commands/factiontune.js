#!/usr/bin/env node
"use strict";
/**
 * factiontune - CLI tool for creating faction-specific vehicle tuning kits
 * Part of Soulvan AI Competition System
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSubmitKit = exports.submitToBlockchain = exports.uploadKit = exports.generateDefaultKit = exports.createTuningKit = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const TUNING_API_URL = process.env.TUNING_API_URL || 'http://localhost:5900/api/tuning';
const IPFS_UPLOAD_URL = process.env.IPFS_UPLOAD_URL || 'https://api.pinata.cloud/pinning/pinFileToIPFS';
/**
 * Create faction-specific tuning kit
 */
function createTuningKit(faction, vehicle, torqueMap, aeroProfile, gripCurve) {
    const kit = {
        faction,
        vehicle,
        torqueMap,
        aeroProfile,
        gripCurve,
        contributor: process.env.WALLET || '0x0000000000000000000000000000000000000000',
        createdAt: new Date().toISOString()
    };
    const filename = `${faction}_${vehicle}_kit.json`;
    fs_1.default.writeFileSync(filename, JSON.stringify(kit, null, 2));
    console.log(`✅ Tuning kit created: ${filename}`);
    return kit;
}
exports.createTuningKit = createTuningKit;
/**
 * Generate default tuning profiles
 */
function generateDefaultKit(faction, vehicle) {
    // Faction-specific tuning characteristics
    const factionProfiles = {
        'NeonReapers': {
            // High speed, low grip (street racing style)
            torqueMultiplier: 1.3,
            downforceMultiplier: 0.8,
            gripMultiplier: 0.9
        },
        'ShadowSyndicate': {
            // Balanced, stealth-oriented
            torqueMultiplier: 1.0,
            downforceMultiplier: 1.0,
            gripMultiplier: 1.1
        },
        'IronCollective': {
            // Heavy, high grip (industrial style)
            torqueMultiplier: 1.1,
            downforceMultiplier: 1.3,
            gripMultiplier: 1.2
        }
    };
    const profile = factionProfiles[faction] || factionProfiles['NeonReapers'];
    // Generate torque curve (RPM 0-8000)
    const torqueMap = [];
    for (let rpm = 0; rpm <= 8000; rpm += 500) {
        const baseTorque = 300 + Math.sin(rpm / 1000) * 150;
        torqueMap.push(baseTorque * profile.torqueMultiplier);
    }
    // Aero profile
    const aeroProfile = {
        downforce: 250 * profile.downforceMultiplier,
        dragCoefficient: 0.28,
        frontalArea: 2.2
    };
    // Grip curve (speed 0-200 km/h)
    const gripCurve = [];
    for (let speed = 0; speed <= 200; speed += 20) {
        const baseGrip = 1.0 - (speed / 400);
        gripCurve.push(baseGrip * profile.gripMultiplier);
    }
    return createTuningKit(faction, vehicle, torqueMap, aeroProfile, gripCurve);
}
exports.generateDefaultKit = generateDefaultKit;
/**
 * Upload tuning kit to IPFS
 */
async function uploadKit(kit) {
    console.log(`📤 Uploading tuning kit to IPFS...`);
    const tempFile = `temp_${Date.now()}.json`;
    fs_1.default.writeFileSync(tempFile, JSON.stringify(kit, null, 2));
    try {
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', fs_1.default.createReadStream(tempFile));
        const response = await axios_1.default.post(IPFS_UPLOAD_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_KEY
            }
        });
        const ipfsHash = response.data.IpfsHash;
        const ipfsUrl = `ipfs://${ipfsHash}`;
        // Clean up temp file
        fs_1.default.unlinkSync(tempFile);
        console.log(`✅ Uploaded to IPFS: ${ipfsUrl}`);
        return ipfsUrl;
    }
    catch (error) {
        // Clean up temp file on error
        if (fs_1.default.existsSync(tempFile)) {
            fs_1.default.unlinkSync(tempFile);
        }
        console.error('❌ IPFS upload failed:', error);
        throw error;
    }
}
exports.uploadKit = uploadKit;
/**
 * Submit kit to blockchain
 */
async function submitToBlockchain(faction, vehicle, ipfsUrl) {
    console.log(`📝 Submitting to blockchain...`);
    try {
        const response = await axios_1.default.post(`${TUNING_API_URL}/kits/submit`, {
            faction,
            vehicle,
            url: ipfsUrl
        });
        console.log(`✅ Kit registered on blockchain! Kit ID: ${response.data.kitId}`);
    }
    catch (error) {
        console.error('❌ Blockchain submission failed:', error);
        throw error;
    }
}
exports.submitToBlockchain = submitToBlockchain;
/**
 * Display kit statistics
 */
function displayKitStats(kit) {
    console.log('\n📊 Tuning Kit Statistics:');
    console.log('═══════════════════════════════════════');
    console.log(`Faction:           ${kit.faction}`);
    console.log(`Vehicle:           ${kit.vehicle}`);
    console.log(`Peak Torque:       ${Math.max(...kit.torqueMap).toFixed(0)} Nm`);
    console.log(`Downforce:         ${kit.aeroProfile.downforce.toFixed(0)} kg`);
    console.log(`Drag Coefficient:  ${kit.aeroProfile.dragCoefficient.toFixed(3)}`);
    console.log(`Max Grip:          ${Math.max(...kit.gripCurve).toFixed(2)}`);
    console.log(`Contributor:       ${kit.contributor.slice(0, 10)}...`);
    console.log('═══════════════════════════════════════\n');
}
/**
 * Complete workflow
 */
async function createAndSubmitKit(faction, vehicle, useDefaults = true) {
    console.log('\n🏎️  Soulvan Faction Tuning Kit Creator\n');
    try {
        // Generate kit
        const kit = useDefaults
            ? generateDefaultKit(faction, vehicle)
            : createTuningKit(faction, vehicle, [], { downforce: 0, dragCoefficient: 0, frontalArea: 0 }, []);
        // Display stats
        displayKitStats(kit);
        // Upload to IPFS
        const ipfsUrl = await uploadKit(kit);
        // Submit to blockchain
        await submitToBlockchain(faction, vehicle, ipfsUrl);
        console.log('\n✨ Tuning kit successfully created and submitted!');
        console.log(`🏁 Your ${faction} ${vehicle} kit is now available for the community!\n`);
    }
    catch (error) {
        console.error('\n💥 Kit creation failed:', error);
        process.exit(1);
    }
}
exports.createAndSubmitKit = createAndSubmitKit;
/**
 * CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('📋 Usage: factiontune <faction> <vehicle> [--custom]');
        console.log('\nExamples:');
        console.log('  factiontune NeonReapers SolusGT');
        console.log('  factiontune ShadowSyndicate PhantomRider');
        console.log('  factiontune IronCollective NeonDrifter --custom\n');
        console.log('Factions: NeonReapers, ShadowSyndicate, IronCollective');
        console.log('Vehicles: SolusGT, PhantomRider, NeonDrifter, VisionGT\n');
        process.exit(1);
    }
    const [faction, vehicle, flag] = args;
    const useDefaults = flag !== '--custom';
    await createAndSubmitKit(faction, vehicle, useDefaults);
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
