import { Command } from 'commander';
import { WalletService } from '../services/wallet';

const program = new Command();

program
  .command('link-wallet <walletAddress>')
  .description('Link a wallet address to the Unity project')
  .action(async (walletAddress) => {
    try {
      const walletService = new WalletService();
      walletService.linkWallet(walletAddress);
      console.log(`Wallet linked successfully: ${walletAddress}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error linking wallet: ${message}`);
    }
  });

export default program;