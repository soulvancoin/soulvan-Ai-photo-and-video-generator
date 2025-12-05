#!/usr/bin/env node

/**
 * prizepush - CLI tool for funding remix prize pools
 * Part of Soulvan AI Competition System
 */

import axios from 'axios';

const PRIZE_API_URL = process.env.PRIZE_API_URL || 'http://localhost:5700/api/prizes';

interface PrizePool {
  trailerId: string;
  totalPool: number;
  contributorCount: number;
  winnerDeclared: boolean;
  winner?: string;
}

/**
 * Fund prize pool
 */
export async function fundPool(trailerId: string, amount: number): Promise<void> {
  console.log(`💰 Funding prize pool for ${trailerId}...`);

  try {
    const response = await axios.post(`${PRIZE_API_URL}/fund`, {
      trailerId,
      amount
    });

    console.log(`✅ Prize pool funded!`);
    console.log(`📊 Total pool: ${response.data.totalPool} ETH`);
    console.log(`👥 Contributors: ${response.data.contributorCount}`);
  } catch (error) {
    console.error('❌ Funding failed:', error);
    throw error;
  }
}

/**
 * Declare winner
 */
export async function declareWinner(trailerId: string, winnerAddress: string): Promise<void> {
  console.log(`🏆 Declaring winner for ${trailerId}...`);

  try {
    const response = await axios.post(`${PRIZE_API_URL}/declare-winner`, {
      trailerId,
      winner: winnerAddress
    });

    console.log(`✅ Winner declared!`);
    console.log(`🎉 Winner: ${response.data.winner}`);
    console.log(`💰 Prize: ${response.data.prizeAmount} ETH`);
    console.log(`📝 Transaction: ${response.data.txHash}`);
  } catch (error) {
    console.error('❌ Winner declaration failed:', error);
    throw error;
  }
}

/**
 * Get prize pool info
 */
export async function getPrizePoolInfo(trailerId: string): Promise<void> {
  console.log(`\n💎 Prize Pool - ${trailerId}\n`);

  try {
    const response = await axios.get(`${PRIZE_API_URL}/${trailerId}`);
    const pool: PrizePool = response.data;

    console.log('═══════════════════════════════════════');
    console.log(`Total Pool:      ${pool.totalPool} ETH`);
    console.log(`Contributors:    ${pool.contributorCount}`);
    console.log(`Status:          ${pool.winnerDeclared ? '🏆 WINNER DECLARED' : '⏳ ACTIVE'}`);
    
    if (pool.winnerDeclared && pool.winner) {
      console.log(`Winner:          ${pool.winner}`);
    }
    
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Failed to fetch prize pool info:', error);
  }
}

/**
 * Get all active prize pools
 */
export async function getAllPrizePools(): Promise<void> {
  console.log('\n💎 Active Prize Pools\n');

  try {
    const response = await axios.get(`${PRIZE_API_URL}/all`);
    const pools = response.data.pools || [];

    if (pools.length === 0) {
      console.log('No active prize pools.');
      return;
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('Trailer ID           Pool (ETH)  Contributors  Status');
    console.log('═══════════════════════════════════════════════════════════');

    pools.forEach((pool: PrizePool) => {
      const trailerId = pool.trailerId.padEnd(20);
      const totalPool = pool.totalPool.toFixed(2).padStart(10);
      const contributors = pool.contributorCount.toString().padStart(13);
      const status = pool.winnerDeclared ? '🏆 COMPLETED' : '⏳ ACTIVE';

      console.log(`${trailerId} ${totalPool}  ${contributors}  ${status}`);
    });

    console.log('═══════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Failed to fetch prize pools:', error);
  }
}

/**
 * Calculate fair prize distribution
 */
function calculatePrizeDistribution(totalPool: number): void {
  console.log('\n💰 Suggested Prize Distribution:\n');
  
  const first = totalPool * 0.5;
  const second = totalPool * 0.3;
  const third = totalPool * 0.2;

  console.log('═══════════════════════════════════════');
  console.log(`1st Place:  ${first.toFixed(2)} ETH (50%)`);
  console.log(`2nd Place:  ${second.toFixed(2)} ETH (30%)`);
  console.log(`3rd Place:  ${third.toFixed(2)} ETH (20%)`);
  console.log('═══════════════════════════════════════');
  console.log(`Total:      ${totalPool.toFixed(2)} ETH\n`);
}

/**
 * Complete workflow
 */
export async function fundPrizePool(trailerId: string, amount: number): Promise<void> {
  console.log('\n💎 Soulvan Prize Pool System\n');

  try {
    // Show current pool info
    await getPrizePoolInfo(trailerId);

    // Fund the pool
    await fundPool(trailerId, amount);

    console.log('\n✨ Prize pool successfully funded!');
    console.log(`🏁 Trailer: ${trailerId}`);
    console.log(`💰 Your contribution: ${amount} ETH\n`);

    // Show updated pool info
    await getPrizePoolInfo(trailerId);

    // Show distribution suggestion
    const response = await axios.get(`${PRIZE_API_URL}/${trailerId}`);
    calculatePrizeDistribution(response.data.totalPool);
  } catch (error) {
    console.error('\n💥 Prize pool funding failed:', error);
    process.exit(1);
  }
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Handle list command
  if (args[0] === 'list' || args[0] === 'ls') {
    await getAllPrizePools();
    return;
  }

  // Handle info command
  if (args[0] === 'info') {
    if (args.length < 2) {
      console.error('❌ Usage: prizepush info <trailer-id>');
      process.exit(1);
    }
    await getPrizePoolInfo(args[1]);
    return;
  }

  // Handle winner command
  if (args[0] === 'winner') {
    if (args.length < 3) {
      console.error('❌ Usage: prizepush winner <trailer-id> <winner-address>');
      process.exit(1);
    }
    await declareWinner(args[1], args[2]);
    return;
  }

  // Handle fund command
  if (args.length < 2) {
    console.log('📋 Usage:');
    console.log('  prizepush <trailer-id> <amount-eth>');
    console.log('  prizepush winner <trailer-id> <winner-address>');
    console.log('  prizepush info <trailer-id>');
    console.log('  prizepush list\n');
    console.log('Examples:');
    console.log('  prizepush trailer_001 5.0');
    console.log('  prizepush winner trailer_001 0x1234...abcd');
    console.log('  prizepush info trailer_001');
    console.log('  prizepush list\n');
    process.exit(1);
  }

  const [trailerId, amountStr] = args;
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    console.error('❌ Invalid amount. Must be a positive number.');
    process.exit(1);
  }

  await fundPrizePool(trailerId, amount);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
