"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const wallet_1 = require("../services/wallet");
const program = new commander_1.Command();
program
    .command('link-wallet <walletAddress>')
    .description('Link a wallet address to the Unity project')
    .action(async (walletAddress) => {
    try {
        const walletService = new wallet_1.WalletService();
        walletService.linkWallet(walletAddress);
        console.log(`Wallet linked successfully: ${walletAddress}`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error linking wallet: ${message}`);
    }
});
exports.default = program;
