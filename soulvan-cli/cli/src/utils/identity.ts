export interface WalletIdentity {
    address: string;
    linkedAt: Date;
}

export function linkIdentity(walletAddress: string): Promise<WalletIdentity> {
    return new Promise((resolve, reject) => {
        if (!walletAddress) {
            return reject(new Error('Wallet address is required.'));
        }

        // Simulate an asynchronous operation to link the wallet identity
        setTimeout(() => {
            const identity: WalletIdentity = {
                address: walletAddress,
                linkedAt: new Date(),
            };
            resolve(identity);
        }, 1000);
    });
}

export function unlinkIdentity(walletAddress: string): Promise<boolean> {
    return new Promise((resolve) => {
        // Simulate an asynchronous operation to unlink the wallet identity
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
}