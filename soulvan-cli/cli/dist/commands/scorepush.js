#!/usr/bin/env node
"use strict";
/**
 * scorepush - CLI tool for calculating and submitting replay scores
 * Part of Soulvan AI Competition System
 *
 * Score Formula: (airtime × 2) + (flips × 3) + (nearMisses × 5) + styleBonus
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAndSubmitScore = exports.getTopScores = exports.submitScore = exports.parseMetricsFromFile = exports.calculateScore = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const SCORING_API_URL = process.env.SCORING_API_URL || 'http://localhost:5800/api/scoring';
/**
 * Calculate score from metrics
 */
function calculateScore(metrics) {
    const airtimePoints = metrics.airtime * 2;
    const flipPoints = metrics.flips * 3;
    const nearMissPoints = metrics.nearMisses * 5;
    const stylePoints = metrics.styleBonus;
    const totalScore = Math.round(airtimePoints + flipPoints + nearMissPoints + stylePoints);
    const breakdown = [
        `Airtime: ${metrics.airtime}s × 2 = ${airtimePoints}`,
        `Flips: ${metrics.flips} × 3 = ${flipPoints}`,
        `Near Misses: ${metrics.nearMisses} × 5 = ${nearMissPoints}`,
        `Style Bonus: ${stylePoints}`,
        `─────────────────────────`,
        `Total Score: ${totalScore}`
    ].join('\n');
    return {
        airtime: metrics.airtime,
        flips: metrics.flips,
        nearMisses: metrics.nearMisses,
        styleBonus: metrics.styleBonus,
        totalScore,
        breakdown
    };
}
exports.calculateScore = calculateScore;
/**
 * Parse metrics from replay JSON
 */
function parseMetricsFromFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`Metrics file not found: ${filePath}`);
    }
    try {
        const data = fs_1.default.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(data);
        return {
            airtime: json.airtime || 0,
            flips: json.flips || 0,
            nearMisses: json.nearMisses || json.near_misses || 0,
            styleBonus: json.styleBonus || json.style_bonus || 0
        };
    }
    catch (error) {
        console.error('❌ Failed to parse metrics file:', error);
        throw error;
    }
}
exports.parseMetricsFromFile = parseMetricsFromFile;
/**
 * Submit score to blockchain
 */
async function submitScore(missionId, contributor, metrics, totalScore) {
    console.log(`📝 Submitting score to blockchain...`);
    try {
        const response = await axios_1.default.post(`${SCORING_API_URL}/scores/submit`, {
            missionId,
            contributor,
            airtime: metrics.airtime,
            flips: metrics.flips,
            nearMisses: metrics.nearMisses,
            styleBonus: metrics.styleBonus,
            totalScore
        });
        console.log(`✅ Score recorded! Score ID: ${response.data.scoreId}`);
        if (response.data.isHighScore) {
            console.log(`🎉 NEW HIGH SCORE for ${missionId}!`);
        }
    }
    catch (error) {
        console.error('❌ Score submission failed:', error);
        throw error;
    }
}
exports.submitScore = submitScore;
/**
 * Get top scores for mission
 */
async function getTopScores(missionId, limit = 10) {
    console.log(`\n🏆 Top Scores - ${missionId}\n`);
    try {
        const response = await axios_1.default.get(`${SCORING_API_URL}/scores/${missionId}?limit=${limit}`);
        const scores = response.data.scores || [];
        if (scores.length === 0) {
            console.log('No scores found for this mission.');
            return;
        }
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('Rank  Contributor          Airtime  Flips  Misses  Style   Total');
        console.log('═══════════════════════════════════════════════════════════════════');
        scores.forEach((score, index) => {
            const rank = (index + 1).toString().padStart(4);
            const contributor = `${score.contributor.slice(0, 10)}...`.padEnd(20);
            const airtime = score.airtime.toFixed(1).padStart(7);
            const flips = score.flips.toString().padStart(6);
            const misses = score.nearMisses.toString().padStart(7);
            const style = score.styleBonus.toString().padStart(7);
            const total = score.totalScore.toString().padStart(7);
            console.log(`${rank}  ${contributor} ${airtime}  ${flips}  ${misses}  ${style}  ${total}`);
        });
        console.log('═══════════════════════════════════════════════════════════════════\n');
    }
    catch (error) {
        console.error('❌ Failed to fetch scores:', error);
    }
}
exports.getTopScores = getTopScores;
/**
 * Display score calculation
 */
function displayScoreBreakdown(result) {
    console.log('\n📊 Score Calculation:\n');
    console.log('═══════════════════════════════════════');
    console.log(result.breakdown);
    console.log('═══════════════════════════════════════\n');
}
/**
 * Interactive metrics input
 */
function promptForMetrics() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        const metrics = {};
        readline.question('Airtime (seconds): ', (airtime) => {
            metrics.airtime = parseFloat(airtime);
            readline.question('Flips: ', (flips) => {
                metrics.flips = parseInt(flips, 10);
                readline.question('Near Misses: ', (nearMisses) => {
                    metrics.nearMisses = parseInt(nearMisses, 10);
                    readline.question('Style Bonus: ', (styleBonus) => {
                        metrics.styleBonus = parseInt(styleBonus, 10);
                        readline.close();
                        resolve(metrics);
                    });
                });
            });
        });
    });
}
/**
 * Complete workflow
 */
async function calculateAndSubmitScore(missionId, metricsInput) {
    console.log('\n🎯 Soulvan Replay Scoring System\n');
    try {
        // Get metrics
        let metrics;
        if (typeof metricsInput === 'string') {
            // Parse from file
            metrics = parseMetricsFromFile(metricsInput);
        }
        else if (metricsInput) {
            // Use provided metrics
            metrics = metricsInput;
        }
        else {
            // Interactive input
            metrics = await promptForMetrics();
        }
        // Calculate score
        const result = calculateScore(metrics);
        displayScoreBreakdown(result);
        // Submit to blockchain
        const contributor = process.env.WALLET || '0x0000000000000000000000000000000000000000';
        await submitScore(missionId, contributor, metrics, result.totalScore);
        console.log('✨ Score successfully calculated and submitted!');
        console.log(`🏁 Mission: ${missionId}`);
        console.log(`📊 Final Score: ${result.totalScore}\n`);
        // Show top scores
        await getTopScores(missionId);
    }
    catch (error) {
        console.error('\n💥 Score submission failed:', error);
        process.exit(1);
    }
}
exports.calculateAndSubmitScore = calculateAndSubmitScore;
/**
 * CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);
    // Handle leaderboard command
    if (args[0] === 'leaderboard' || args[0] === 'lb') {
        const missionId = args[1];
        if (!missionId) {
            console.error('❌ Mission ID required. Usage: scorepush leaderboard <mission-id>');
            process.exit(1);
        }
        await getTopScores(missionId);
        return;
    }
    // Handle score calculation
    if (args.length === 0) {
        console.log('📋 Usage:');
        console.log('  scorepush <mission-id> [metrics-file.json]');
        console.log('  scorepush <mission-id> <airtime> <flips> <near-misses> <style-bonus>');
        console.log('  scorepush leaderboard <mission-id>\n');
        console.log('Examples:');
        console.log('  scorepush night_chase metrics.json');
        console.log('  scorepush tokyo_drift 12.5 3 8 500');
        console.log('  scorepush leaderboard night_chase\n');
        process.exit(1);
    }
    const [missionId, ...rest] = args;
    // Check if metrics file provided
    if (rest.length === 1 && rest[0].endsWith('.json')) {
        await calculateAndSubmitScore(missionId, rest[0]);
        return;
    }
    // Check if individual metrics provided
    if (rest.length === 4) {
        const [airtimeStr, flipsStr, nearMissesStr, styleBonusStr] = rest;
        const metrics = {
            airtime: parseFloat(airtimeStr),
            flips: parseInt(flipsStr, 10),
            nearMisses: parseInt(nearMissesStr, 10),
            styleBonus: parseInt(styleBonusStr, 10)
        };
        if (isNaN(metrics.airtime) || isNaN(metrics.flips) || isNaN(metrics.nearMisses) || isNaN(metrics.styleBonus)) {
            console.error('❌ Invalid metrics. All values must be numbers.');
            process.exit(1);
        }
        await calculateAndSubmitScore(missionId, metrics);
        return;
    }
    // Interactive mode
    await calculateAndSubmitScore(missionId);
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
