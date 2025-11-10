#!/usr/bin/env node
"use strict";
/**
 * weathermod - CLI tool for applying weather-based mission modifiers
 * Part of Soulvan AI Mythic Loop System
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyModifiers = void 0;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'http://localhost:5500/api/weather';
const MISSION_API_URL = process.env.MISSION_API_URL || 'http://localhost:5400/api/missions';
/**
 * Fetch weather data for a specific zone
 */
async function fetchWeather(zone) {
    try {
        const response = await axios_1.default.get(`${WEATHER_API_URL}?zone=${zone}`);
        return response.data;
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to fetch weather for ${zone}`));
        throw error;
    }
}
/**
 * Calculate mission modifiers based on weather conditions
 */
function calculateModifiers(weather) {
    const modifiers = {
        difficultyMultiplier: 1.0,
        vehicleHandlingMultiplier: 1.0,
        visibilityMultiplier: 1.0,
        enemyAwarenessMultiplier: 1.0,
        staminaDrainMultiplier: 1.0,
        projectileAccuracyMultiplier: 1.0
    };
    // Rain modifiers
    if (weather.condition === 'rain') {
        modifiers.difficultyMultiplier += 0.3;
        modifiers.vehicleHandlingMultiplier *= 0.85;
        modifiers.visibilityMultiplier *= 0.8;
        modifiers.enemyAwarenessMultiplier *= 0.9;
    }
    // Snow modifiers
    else if (weather.condition === 'snow') {
        modifiers.difficultyMultiplier += 0.5;
        modifiers.vehicleHandlingMultiplier *= 0.7;
        modifiers.visibilityMultiplier *= 0.6;
        modifiers.enemyAwarenessMultiplier *= 0.8;
    }
    // Fog modifiers
    else if (weather.condition === 'fog') {
        modifiers.visibilityMultiplier *= 0.4;
        modifiers.enemyAwarenessMultiplier *= 0.7;
    }
    // Storm modifiers
    else if (weather.condition === 'storm') {
        modifiers.difficultyMultiplier += 0.8;
        modifiers.vehicleHandlingMultiplier *= 0.6;
        modifiers.visibilityMultiplier *= 0.5;
        modifiers.enemyAwarenessMultiplier *= 0.75;
    }
    // Night modifiers
    else if (weather.isNight) {
        modifiers.difficultyMultiplier += 0.2;
        modifiers.visibilityMultiplier *= 0.5;
        modifiers.enemyAwarenessMultiplier *= 0.85;
    }
    // Temperature effects
    if (weather.temperature < 0) {
        modifiers.staminaDrainMultiplier *= 1.2; // Freezing drains stamina
    }
    else if (weather.temperature > 35) {
        modifiers.staminaDrainMultiplier *= 1.15; // Heat drains stamina
    }
    // Wind effects
    if (weather.windSpeed > 15) {
        modifiers.projectileAccuracyMultiplier *= 0.85; // High wind affects accuracy
    }
    return modifiers;
}
/**
 * Apply modifiers to a mission
 */
async function applyModifiersToMission(zone, missionId, modifiers) {
    try {
        const response = await axios_1.default.patch(`${MISSION_API_URL}/${missionId}/modifiers`, {
            zone,
            modifiers,
            timestamp: new Date().toISOString()
        });
        console.log(chalk_1.default.green(`✅ Applied weather modifiers to mission ${missionId}`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to apply modifiers to mission ${missionId}`));
        throw error;
    }
}
/**
 * Display weather and modifiers in a formatted table
 */
function displayWeatherInfo(zone, weather, modifiers) {
    console.log('\n' + chalk_1.default.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk_1.default.bold.white(`  Weather Report: ${zone}`));
    console.log(chalk_1.default.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    // Weather emoji
    const emoji = getWeatherEmoji(weather.condition);
    console.log(`  ${emoji}  ${chalk_1.default.bold(weather.condition.toUpperCase())}`);
    console.log(`  🌡️   Temperature: ${chalk_1.default.yellow(weather.temperature.toFixed(1))}°C`);
    console.log(`  💨  Wind Speed: ${chalk_1.default.cyan(weather.windSpeed.toFixed(1))} m/s`);
    console.log(`  💧  Humidity: ${chalk_1.default.blue(weather.humidity.toFixed(0))}%`);
    console.log(`  👁️   Visibility: ${chalk_1.default.white(weather.visibility.toFixed(0))}m`);
    if (weather.precipitation > 0) {
        console.log(`  🌧️   Precipitation: ${chalk_1.default.magenta(weather.precipitation.toFixed(1))} mm/h`);
    }
    console.log('\n' + chalk_1.default.bold.yellow('  Mission Modifiers:'));
    console.log(chalk_1.default.bold.cyan('  ─────────────────────────────────────────\n'));
    displayModifier('Difficulty', modifiers.difficultyMultiplier, 1.0, true);
    displayModifier('Vehicle Handling', modifiers.vehicleHandlingMultiplier, 1.0, false);
    displayModifier('Visibility', modifiers.visibilityMultiplier, 1.0, false);
    displayModifier('Enemy Awareness', modifiers.enemyAwarenessMultiplier, 1.0, false);
    displayModifier('Stamina Drain', modifiers.staminaDrainMultiplier, 1.0, true);
    displayModifier('Projectile Accuracy', modifiers.projectileAccuracyMultiplier, 1.0, false);
    console.log(chalk_1.default.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}
/**
 * Display a single modifier with color coding
 */
function displayModifier(name, value, baseline, higherIsWorse) {
    const percentage = ((value - baseline) * 100).toFixed(0);
    const sign = value > baseline ? '+' : '';
    let color = chalk_1.default.white;
    if (higherIsWorse) {
        color = value > baseline ? chalk_1.default.red : value < baseline ? chalk_1.default.green : chalk_1.default.white;
    }
    else {
        color = value < baseline ? chalk_1.default.red : value > baseline ? chalk_1.default.green : chalk_1.default.white;
    }
    const arrow = value > baseline ? '▲' : value < baseline ? '▼' : '━';
    console.log(`  ${arrow} ${name.padEnd(20)} ${color(`x${value.toFixed(2)} (${sign}${percentage}%)`)}`);
}
/**
 * Get emoji for weather condition
 */
function getWeatherEmoji(condition) {
    const emojis = {
        'clear': '☀️',
        'rain': '☔',
        'snow': '❄️',
        'fog': '🌫️',
        'storm': '⛈️',
        'night': '🌙'
    };
    return emojis[condition] || '🌍';
}
/**
 * Main function: Apply weather modifiers to a mission
 */
async function applyModifiers(zone, missionId) {
    console.log(chalk_1.default.bold.cyan(`\n🌦️  Applying weather modifiers to ${missionId} in ${zone}...\n`));
    const spinner = (0, ora_1.default)('Fetching weather data...').start();
    try {
        // Fetch weather
        const weather = await fetchWeather(zone);
        spinner.succeed(chalk_1.default.green('Weather data retrieved'));
        // Calculate modifiers
        const modifiers = calculateModifiers(weather);
        // Display info
        displayWeatherInfo(zone, weather, modifiers);
        // Apply to mission
        spinner.start('Applying modifiers to mission...');
        await applyModifiersToMission(zone, missionId, modifiers);
        spinner.succeed(chalk_1.default.green('Mission updated successfully'));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to apply weather modifiers'));
        throw error;
    }
}
exports.applyModifiers = applyModifiers;
/**
 * CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log(chalk_1.default.yellow('\n📋 Usage: weathermod <zone> <missionId>\n'));
        console.log('Examples:');
        console.log('  weathermod NeonDistrict mission_001');
        console.log('  weathermod IndustrialBay heist_alpha');
        console.log('  weathermod ShadowQuarter stealth_op\n');
        process.exit(1);
    }
    const [zone, missionId] = args;
    try {
        await applyModifiers(zone, missionId);
        process.exit(0);
    }
    catch (error) {
        console.error(chalk_1.default.red('\n❌ Error:'), error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    main();
}
