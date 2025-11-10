# Soulvan Wallet Creator

Interactive Python script for onboarding new contributors to the Soulvan ecosystem.

## Features

✅ Generates Ethereum wallet using `eth_account`  
✅ Interactive truck style selector (chrome, matte, graffiti, mythic, cyberpunk)  
✅ Saves profile JSON with wallet address and style preference  
✅ Music genre hints for each truck style  

## Installation

```bash
cd services/wallet-creator
pip install -r requirements.txt
```

## Usage

```bash
python create_contributor_profile.py
```

**Example output:**

```
============================================================
🎨 SOULVAN CONTRIBUTOR ONBOARDING
============================================================

📝 Generating Ethereum wallet...
✅ Wallet created: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4

🚚 Choose your Soulvan truck style:
1. chrome       → synthwave, electronica
2. matte        → deep house, minimal techno
3. graffiti     → hip-hop, trap
4. mythic       → orchestral, epic
5. cyberpunk    → industrial, glitch-hop

Enter number (1-5): 3

✅ Selected style: graffiti

💾 Profile saved to: contributors/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4.json

============================================================
⚠️  SECURITY WARNING
============================================================
Your private key is stored in the profile JSON.
DO NOT share this file or commit it to version control!
Private key: 0x4c0883a6...ab8a13

Backup this file securely and delete it from disk after importing
the wallet into your preferred Ethereum wallet app.
============================================================
```

## Output Format

Profile JSON structure:

```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "truck_style": "graffiti",
  "private_key": "0x4c0883a6...",
  "created_at": "2025-11-09T00:00:00Z"
}
```

## Integration with Other Services

1. **CLI link-wallet command**: Use generated address with `soulvan-cli link-wallet`
2. **Music API**: POST to `/api/music/style` with `truck_style` for genre mapping
3. **DAO voting**: Address must hold SoulvanCoin to participate in votes
4. **PostgreSQL**: Store wallet address in `music_styles` table

## Security Best Practices

⚠️ **CRITICAL**: Private keys are sensitive!

- Never commit `contributors/*.json` files to Git
- Add `contributors/` to `.gitignore`
- Import wallet into MetaMask/hardware wallet ASAP
- Delete profile JSON after import
- For production, use hardware wallets or MPC solutions

## Next Steps After Profile Creation

1. Import private key into MetaMask
2. Acquire SoulvanCoin for DAO voting rights
3. Link wallet to Unity Editor via CLI: `soulvan link-wallet --address 0x...`
4. Submit first render job with signature
5. Vote on community jobs via dashboard

## Related Services

- **DAO Voting API**: `services/dao-voting/server.py` (port 5300)
- **Music Style Mapper**: POST `/api/music/style` endpoint
- **Wallet Identity CLI**: `soulvan-cli/cli/src/utils/identity.ts`
