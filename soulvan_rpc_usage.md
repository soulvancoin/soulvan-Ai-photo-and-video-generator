# Soulvan 4K Asset Anchoring Guide

This guide explains how to record metadata for generated 4K images and videos
on the Soulvan blockchain using `soulvan_rpc_client.py`.

## 1. Prerequisites

1. **Soulvan Coin Core Daemon**
   - Install and start the Soulvan node from
     `https://github.com/soulvancoin/soulvan-coin-core`.
   - Ensure the node is configured for JSON-RPC access (set `rpcuser`,
     `rpcpassword`, and `rpcport` in the configuration file).
   - Unlock the wallet if it is encrypted, e.g.:
     ```bash
     soulvan-cli walletpassphrase "your passphrase" 600
     ```

2. **Environment Variables**
   Define the following variables in your shell or process manager before
   running any scripts that import the client:
   ```bash
   export SOULVAN_RPC_URL="http://127.0.0.1:8332"
   export SOULVAN_RPC_USER="yourrpcuser"
   export SOULVAN_RPC_PASS="yourrpcpass"
   ```

3. **Python Dependencies**
   Install the required HTTP client:
   ```bash
   pip install requests
   ```

## 2. Generating Metadata

Use `build_metadata_from_asset` to calculate the SHA-256 hash for a generated
asset and create an `AssetMetadata` instance:

```python
from soulvan_rpc_client import build_metadata_from_asset

metadata = build_metadata_from_asset(
    asset_path="/absolute/path/to/output_4k.mp4",
    uri="ipfs://bafy...",
    asset_type="video",
    resolution="3840x2160",
    prompt="Cyberpunk skyline in neon rain",
    model="Cosmos-Predict1",
    extras={"seed": 12345},
)
```

## 3. Anchoring Metadata On-Chain

Create a `SoulvanRPCClient` and broadcast the metadata using an OP_RETURN
output:

```python
from soulvan_rpc_client import SoulvanRPCClient

client = SoulvanRPCClient()
txid = client.anchor_asset_metadata(metadata)
print(f"Soulvan transaction ID: {txid}")
```

The utility automatically funds, signs, and broadcasts the raw transaction,
tagging it with the label `4k_ai_asset` for quick lookup.

## 4. Troubleshooting

- **Wallet Locked**: The helper raises an error if the wallet is locked.
  Unlock it beforehand or integrate a secure passphrase workflow.
- **Insufficient Funds**: Ensure the wallet has enough balance to pay network
  fees.
- **RPC Connection Errors**: Double-check the environment variables and that
  the node is reachable at the specified URL.
- **OP_RETURN Size**: OP_RETURN scripts have a size limit. Keep metadata
  compact and store large descriptions off-chain, referencing them via the
  `uri` field.

## 5. Recommended Workflow

1. Generate the 4K asset via your AI pipeline (Cosmos, Cosmos Predict, etc.).
2. Upload the asset to resilient storage (IPFS, S3, Arweave) and note its URI.
3. Use `build_metadata_from_asset` to calculate the hash and assemble metadata.
4. Call `anchor_asset_metadata` to publish the metadata hash on Soulvan.
5. Persist the transaction ID in your application database for provenance
   tracking and allow users to verify the blockchain record.
