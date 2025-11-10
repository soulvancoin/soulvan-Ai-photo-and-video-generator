# WALLET IDENTITY LINKING PROCESS

## Overview
The wallet identity linking process allows users to connect their digital wallets to the Soulvan project, enabling seamless interactions and transactions within the Unity environment. This document outlines the steps required to link a wallet identity and the underlying mechanisms involved.

## Prerequisites
- A compatible digital wallet (e.g., MetaMask, Trust Wallet).
- The Soulvan CLI installed and configured.
- Access to the Unity project where the wallet identity will be linked.

## Steps to Link Wallet Identity

1. **Install the Soulvan CLI**
   Ensure that the Soulvan CLI is installed on your machine. You can install it using npm:
   ```
   npm install -g soulvan-cli
   ```

2. **Open the Command Line Interface**
   Launch your terminal or command prompt.

3. **Navigate to Your Unity Project Directory**
   Change your directory to the root of your Unity project:
   ```
   cd path/to/your/unity/project
   ```

4. **Link Your Wallet**
   Use the following command to initiate the wallet linking process:
   ```
   soulvan link-wallet --wallet <YOUR_WALLET_ADDRESS>
   ```
   Replace `<YOUR_WALLET_ADDRESS>` with your actual wallet address.

5. **Confirm the Linking**
   After executing the command, you will receive a confirmation message indicating that your wallet has been successfully linked. You may also need to confirm the transaction in your wallet application.

## Troubleshooting
- If you encounter issues during the linking process, ensure that your wallet is properly configured and that you have sufficient permissions.
- Check the CLI output for any error messages that may provide insight into the problem.

## Conclusion
Linking your wallet identity to the Soulvan project enhances your experience by enabling various functionalities related to transactions and interactions within the Unity environment. For further assistance, refer to the Soulvan documentation or reach out to the support team.