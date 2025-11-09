"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkIdentity = exports.linkIdentity = void 0;
function linkIdentity(walletAddress) {
    return new Promise((resolve, reject) => {
        if (!walletAddress) {
            return reject(new Error('Wallet address is required.'));
        }
        // Simulate an asynchronous operation to link the wallet identity
        setTimeout(() => {
            const identity = {
                address: walletAddress,
                linkedAt: new Date(),
            };
            resolve(identity);
        }, 1000);
    });
}
exports.linkIdentity = linkIdentity;
function unlinkIdentity(walletAddress) {
    return new Promise((resolve) => {
        // Simulate an asynchronous operation to unlink the wallet identity
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
}
exports.unlinkIdentity = unlinkIdentity;
