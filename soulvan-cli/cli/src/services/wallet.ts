import { WalletIdentity } from '../utils/identity';

export class WalletService {
    private walletIdentity: WalletIdentity | null = null;

    public linkWallet(address: string): void {
        this.walletIdentity = {
            address,
            linkedAt: new Date()
        };
        console.log(`Wallet linked: ${address}`);
    }

    public unlinkWallet(): void {
        if (this.walletIdentity) {
            console.log(`Wallet unlinked: ${this.walletIdentity.address}`);
            this.walletIdentity = null;
        } else {
            console.log('No wallet linked to unlink.');
        }
    }

    public getWalletIdentity(): string | null {
        return this.walletIdentity ? this.walletIdentity.address : null;
    }
}