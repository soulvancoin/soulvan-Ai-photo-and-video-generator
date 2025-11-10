#!/usr/bin/env node

/**
 * replaytourney - CLI tool for submitting mission replays to tournaments
 * Part of Soulvan AI Competition System
 */

import fs from 'fs';
import axios from 'axios';

const REPLAY_API_URL = process.env.REPLAY_API_URL || 'http://localhost:5800/api/replays';
const TOURNAMENT_API_URL = process.env.TOURNAMENT_API_URL || 'http://localhost:5800/api/tournaments';
const IPFS_UPLOAD_URL = process.env.IPFS_UPLOAD_URL || 'https://api.pinata.cloud/pinning/pinFileToIPFS';

interface ReplayMetadata {
  missionId: string;
  contributor: string;
  duration: number;
  completionTime: number;
  timestamp: string;
  replayUrl?: string;
}

interface TournamentEntry {
  missionId: string;
  replayUrl: string;
  contributor: string;
  score: number;
}

/**
 * Upload replay file to IPFS
 */
export async function uploadReplay(replayPath: string): Promise<string> {
  console.log(`📤 Uploading replay to IPFS...`);

  if (!fs.existsSync(replayPath)) {
    throw new Error(`Replay file not found: ${replayPath}`);
  }

  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(replayPath));

    const response = await axios.post(IPFS_UPLOAD_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY
      }
    });

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    console.log(`✅ Uploaded to IPFS: ${ipfsUrl}`);
    return ipfsUrl;
  } catch (error) {
    console.error('❌ IPFS upload failed:', error);
    throw error;
  }
}

/**
 * Register replay on MissionReplay contract
 */
export async function registerReplay(
  missionId: string,
  replayUrl: string,
  score: number
): Promise<void> {
  console.log(`📝 Registering replay on blockchain...`);

  try {
    const response = await axios.post(`${REPLAY_API_URL}/register`, {
      missionId,
      replayUrl,
      score
    });

    console.log(`✅ Replay registered! Replay ID: ${response.data.replayId}`);
  } catch (error) {
    console.error('❌ Replay registration failed:', error);
    throw error;
  }
}

/**
 * Submit replay to tournament
 */
export async function submitToTournament(
  missionId: string,
  replayUrl: string,
  score: number
): Promise<void> {
  console.log(`🏆 Submitting to tournament...`);

  try {
    const response = await axios.post(`${TOURNAMENT_API_URL}/entries/submit`, {
      missionId,
      replayUrl,
      score
    });

    console.log(`✅ Tournament entry submitted! Entry ID: ${response.data.entryId}`);
    console.log(`📊 Current rank: ${response.data.rank}/${response.data.totalEntries}`);
    
    if (response.data.rank <= 10) {
      console.log(`🎉 You're in the TOP 10! Keep it up!`);
    }
  } catch (error) {
    console.error('❌ Tournament submission failed:', error);
    throw error;
  }
}

/**
 * Get tournament leaderboard
 */
export async function getLeaderboard(missionId?: string): Promise<void> {
  console.log('\n🏆 Tournament Leaderboard\n');

  try {
    const url = missionId
      ? `${TOURNAMENT_API_URL}/entries/${missionId}`
      : `${TOURNAMENT_API_URL}/entries/all`;

    const response = await axios.get(url);
    const entries = response.data.entries || [];

    if (entries.length === 0) {
      console.log('No tournament entries found.');
      return;
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('Rank  Mission              Contributor          Score');
    console.log('═══════════════════════════════════════════════════════════');

    entries.slice(0, 10).forEach((entry: any, index: number) => {
      const rank = (index + 1).toString().padStart(4);
      const mission = entry.missionId.padEnd(20);
      const contributor = `${entry.contributor.slice(0, 10)}...`.padEnd(20);
      const score = entry.score.toString().padStart(8);
      
      console.log(`${rank}  ${mission} ${contributor} ${score}`);
    });

    console.log('═══════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Failed to fetch leaderboard:', error);
  }
}

/**
 * Parse replay metadata (if exists)
 */
function parseReplayMetadata(replayPath: string): ReplayMetadata | null {
  const metadataPath = replayPath.replace(/\.(mp4|webm|replay)$/, '.json');
  
  if (fs.existsSync(metadataPath)) {
    try {
      const data = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('⚠️  Could not parse replay metadata');
    }
  }
  
  return null;
}

/**
 * Complete workflow
 */
export async function submitReplay(
  replayPath: string,
  missionId: string,
  score: number
): Promise<void> {
  console.log('\n🎬 Soulvan Replay Tournament Submission\n');

  try {
    // Parse metadata
    const metadata = parseReplayMetadata(replayPath);
    if (metadata) {
      console.log(`📋 Replay metadata found:`);
      console.log(`   Mission: ${metadata.missionId}`);
      console.log(`   Duration: ${metadata.duration}s`);
      console.log(`   Completion: ${metadata.completionTime}s\n`);
      
      // Use metadata mission ID if not provided
      missionId = missionId || metadata.missionId;
    }

    // Upload replay
    const replayUrl = await uploadReplay(replayPath);

    // Register on blockchain
    await registerReplay(missionId, replayUrl, score);

    // Submit to tournament
    await submitToTournament(missionId, replayUrl, score);

    console.log('\n✨ Replay successfully submitted to tournament!');
    console.log(`🏁 Mission: ${missionId}`);
    console.log(`📊 Score: ${score}\n`);

    // Show current leaderboard
    await getLeaderboard(missionId);
  } catch (error) {
    console.error('\n💥 Submission failed:', error);
    process.exit(1);
  }
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Handle leaderboard command
  if (args[0] === 'leaderboard' || args[0] === 'lb') {
    const missionId = args[1];
    await getLeaderboard(missionId);
    return;
  }

  // Handle replay submission
  if (args.length < 3) {
    console.log('📋 Usage:');
    console.log('  replaytourney <replay-file> <mission-id> <score>');
    console.log('  replaytourney leaderboard [mission-id]\n');
    console.log('Examples:');
    console.log('  replaytourney race_001.mp4 night_chase 8500');
    console.log('  replaytourney drift_run.webm tokyo_drift 12000');
    console.log('  replaytourney leaderboard night_chase\n');
    process.exit(1);
  }

  const [replayPath, missionId, scoreStr] = args;
  const score = parseInt(scoreStr, 10);

  if (isNaN(score)) {
    console.error('❌ Invalid score. Must be a number.');
    process.exit(1);
  }

  await submitReplay(replayPath, missionId, score);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
