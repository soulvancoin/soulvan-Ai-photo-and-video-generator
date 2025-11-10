"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
class WalletService {
    constructor() {
        this.walletIdentity = null;
    }
    linkWallet(address) {
        this.walletIdentity = {
            address,
            linkedAt: new Date()
        };
        console.log(`Wallet linked: ${address}`);
    }
    unlinkWallet() {
        if (this.walletIdentity) {
            console.log(`Wallet unlinked: ${this.walletIdentity.address}`);
            this.walletIdentity = null;
        }
        else {
            console.log('No wallet linked to unlink.');
        }
    }
    getWalletIdentity() {
        return this.walletIdentity ? this.walletIdentity.address : null;
    }
}
exports.WalletService = WalletService;
