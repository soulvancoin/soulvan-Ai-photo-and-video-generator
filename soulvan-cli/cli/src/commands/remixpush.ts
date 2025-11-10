#!/usr/bin/env node

/**
 * remixpush - CLI tool for submitting trailer remix to competitions
 * Part of Soulvan AI Competition System
 */

import fs from 'fs';
import axios from 'axios';

const REMIX_API_URL = process.env.REMIX_API_URL || 'http://localhost:5700/api/remixes';
const IPFS_UPLOAD_URL = process.env.IPFS_UPLOAD_URL || 'https://api.pinata.cloud/pinning/pinFileToIPFS';

interface RemixMetadata {
  originalTrailer: string;
  remixer: string;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  remixUrl?: string;
}

/**
 * Upload remix video to IPFS
 */
export async function uploadRemix(remixPath: string): Promise<string> {
  console.log(`📤 Uploading remix to IPFS...`);

  if (!fs.existsSync(remixPath)) {
    throw new Error(`Remix file not found: ${remixPath}`);
  }

  const stats = fs.statSync(remixPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📦 File size: ${fileSizeMB} MB`);

  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(remixPath));

    const response = await axios.post(IPFS_UPLOAD_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
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
 * Submit remix to blockchain
 */
export async function submitRemix(
  originalTrailer: string,
  remixUrl: string,
  title: string,
  description: string
): Promise<void> {
  console.log(`📝 Submitting remix to blockchain...`);

  try {
    const response = await axios.post(`${REMIX_API_URL}/submit`, {
      originalTrailer,
      remixUrl,
      title,
      description
    });

    console.log(`✅ Remix submitted! Remix ID: ${response.data.remixId}`);
    console.log(`🗳️  Current votes: ${response.data.votes || 0}`);
  } catch (error) {
    console.error('❌ Remix submission failed:', error);
    throw error;
  }
}

/**
 * Vote for a remix
 */
export async function voteForRemix(remixId: string): Promise<void> {
  console.log(`🗳️  Voting for remix ${remixId}...`);

  try {
    const response = await axios.post(`${REMIX_API_URL}/vote/${remixId}`);

    console.log(`✅ Vote recorded!`);
    console.log(`📊 Total votes: ${response.data.totalVotes}`);
    
    if (response.data.totalVotes === 10) {
      console.log(`🎉 Remix has reached 10 votes and is now APPROVED!`);
    }
    
    if (response.data.totalVotes === 50) {
      console.log(`🌟 Remix has reached 50 votes and is now FEATURED!`);
    }
  } catch (error) {
    console.error('❌ Vote failed:', error);
    throw error;
  }
}

/**
 * Get top remixes
 */
export async function getTopRemixes(originalTrailer?: string, limit: number = 10): Promise<void> {
  console.log('\n🎬 Top Trailer Remixes\n');

  try {
    const url = originalTrailer
      ? `${REMIX_API_URL}/${originalTrailer}?limit=${limit}`
      : `${REMIX_API_URL}/all?limit=${limit}`;

    const response = await axios.get(url);
    const remixes = response.data.remixes || [];

    if (remixes.length === 0) {
      console.log('No remixes found.');
      return;
    }

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('ID    Title                      Remixer              Votes  Status');
    console.log('═══════════════════════════════════════════════════════════════════');

    remixes.forEach((remix: any) => {
      const id = remix.remixId.padEnd(5);
      const title = remix.title.slice(0, 25).padEnd(26);
      const remixer = `${remix.remixer.slice(0, 10)}...`.padEnd(20);
      const votes = remix.votes.toString().padStart(5);
      
      let status = '';
      if (remix.votes >= 50) status = '⭐ FEATURED';
      else if (remix.votes >= 10) status = '✅ APPROVED';
      else status = '⏳ PENDING';

      console.log(`${id} ${title} ${remixer} ${votes}  ${status}`);
    });

    console.log('═══════════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Failed to fetch remixes:', error);
  }
}

/**
 * Parse remix metadata
 */
function parseRemixMetadata(remixPath: string): RemixMetadata | null {
  const metadataPath = remixPath.replace(/\.(mp4|webm|mov|avi)$/, '.json');
  
  if (fs.existsSync(metadataPath)) {
    try {
      const data = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('⚠️  Could not parse remix metadata');
    }
  }
  
  return null;
}

/**
 * Create metadata file template
 */
function createMetadataTemplate(remixPath: string): string {
  const metadataPath = remixPath.replace(/\.(mp4|webm|mov|avi)$/, '.json');
  
  const template = {
    originalTrailer: 'trailer_001',
    title: 'My Epic Remix',
    description: 'An awesome remix of the original trailer with custom music and effects',
    duration: 120,
    remixer: process.env.WALLET || '0x0000000000000000000000000000000000000000',
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(metadataPath, JSON.stringify(template, null, 2));
  console.log(`📝 Created metadata template: ${metadataPath}`);
  console.log(`⚠️  Please edit this file with your remix details before submitting.`);
  
  return metadataPath;
}

/**
 * Complete workflow
 */
export async function uploadAndSubmitRemix(
  remixPath: string,
  originalTrailer?: string,
  title?: string,
  description?: string
): Promise<void> {
  console.log('\n🎥 Soulvan Trailer Remix Competition\n');

  try {
    // Parse metadata
    let metadata = parseRemixMetadata(remixPath);
    
    if (!metadata) {
      if (!originalTrailer || !title || !description) {
        console.log('⚠️  No metadata file found. Creating template...\n');
        createMetadataTemplate(remixPath);
        console.log('\nPlease fill in the metadata and run again.');
        return;
      }
      
      metadata = {
        originalTrailer,
        title,
        description,
        duration: 0,
        remixer: process.env.WALLET || '0x0000000000000000000000000000000000000000',
        createdAt: new Date().toISOString()
      };
    }

    console.log(`📋 Remix Details:`);
    console.log(`   Original: ${metadata.originalTrailer}`);
    console.log(`   Title: ${metadata.title}`);
    console.log(`   Description: ${metadata.description}\n`);

    // Upload remix
    const remixUrl = await uploadRemix(remixPath);

    // Submit to blockchain
    await submitRemix(
      metadata.originalTrailer,
      remixUrl,
      metadata.title,
      metadata.description
    );

    console.log('\n✨ Remix successfully submitted!');
    console.log(`🎬 Your remix is now live in the competition!\n`);

    // Show top remixes
    await getTopRemixes(metadata.originalTrailer);
  } catch (error) {
    console.error('\n💥 Remix submission failed:', error);
    process.exit(1);
  }
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Handle vote command
  if (args[0] === 'vote') {
    if (args.length < 2) {
      console.error('❌ Usage: remixpush vote <remix-id>');
      process.exit(1);
    }
    await voteForRemix(args[1]);
    return;
  }

  // Handle leaderboard command
  if (args[0] === 'leaderboard' || args[0] === 'lb') {
    const originalTrailer = args[1];
    await getTopRemixes(originalTrailer);
    return;
  }

  // Handle remix submission
  if (args.length === 0) {
    console.log('📋 Usage:');
    console.log('  remixpush <remix-file> [original-trailer] [title] [description]');
    console.log('  remixpush vote <remix-id>');
    console.log('  remixpush leaderboard [original-trailer]\n');
    console.log('Examples:');
    console.log('  remixpush my_remix.mp4');
    console.log('  remixpush my_remix.mp4 trailer_001 "Epic Remix" "Custom music and effects"');
    console.log('  remixpush vote remix_123');
    console.log('  remixpush leaderboard trailer_001\n');
    process.exit(1);
  }

  const [remixPath, originalTrailer, title, ...descParts] = args;
  const description = descParts.join(' ');

  await uploadAndSubmitRemix(remixPath, originalTrailer, title, description);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
