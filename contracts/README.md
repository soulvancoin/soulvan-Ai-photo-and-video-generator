# Soulvan Smart Contracts

Solidity contracts for DAO governance and on-chain voting for render job upgrades.

## Contracts

### SoulvanUpgradeVoting.sol

Decentralized voting contract for approving/rejecting Soulvan render job personalizations.

**Features:**
- ✅ ERC20 token-gated voting (requires SoulvanCoin balance)
- ✅ One vote per wallet per job
- ✅ Majority approval required for upgrades
- ✅ Reason strings for transparency
- ✅ Proposal creation and execution tracking
- ✅ Event emissions for off-chain indexing

**Key Functions:**

```solidity
// Create a new upgrade proposal
createProposal(bytes32 jobId)

// Cast a vote with optional reason
voteOnUpgrade(bytes32 jobId, bool approve, string memory reason)

// Execute upgrade if approved
applyUpgrade(bytes32 jobId)

// Query vote tallies
getTally(bytes32 jobId) returns (uint256 approveCount, uint256 rejectCount, bool executed)

// Get all votes for a job
getVotes(bytes32 jobId) returns (Vote[] memory)
```

## Installation

```bash
# Install dependencies (Foundry toolchain)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Or using Hardhat
npm install --save-dev hardhat @openzeppelin/contracts
```

## Compilation

**Using Foundry:**

```bash
cd contracts
forge build
```

**Using Hardhat:**

```bash
npx hardhat compile
```

## Deployment

**Example Foundry deployment script:**

```bash
forge create --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  contracts/SoulvanUpgradeVoting.sol:SoulvanUpgradeVoting \
  --constructor-args $SOULVAN_COIN_ADDRESS
```

**Example Hardhat deployment:**

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const soulvanCoinAddress = "0xYourSoulvanCoinAddress";
  
  const SoulvanUpgradeVoting = await ethers.getContractFactory("SoulvanUpgradeVoting");
  const voting = await SoulvanUpgradeVoting.deploy(soulvanCoinAddress);
  await voting.deployed();
  
  console.log("SoulvanUpgradeVoting deployed to:", voting.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Run: `npx hardhat run scripts/deploy.js --network sepolia`

## Testing

**Foundry tests:**

```bash
forge test -vv
```

**Example test structure:**

```solidity
// test/SoulvanUpgradeVoting.t.sol
contract SoulvanUpgradeVotingTest is Test {
    SoulvanUpgradeVoting voting;
    MockERC20 soulvanCoin;
    
    function setUp() public {
        soulvanCoin = new MockERC20();
        voting = new SoulvanUpgradeVoting(address(soulvanCoin));
    }
    
    function testVoteRequiresToken() public {
        bytes32 jobId = keccak256("job1");
        vm.expectRevert();
        voting.voteOnUpgrade(jobId, true, "test");
    }
}
```

## Integration with Services

### 1. Off-Chain to On-Chain Flow

```javascript
// services/dao-voting/blockchain-integration.js
const ethers = require('ethers');

async function submitVoteToChain(jobId, wallet, approve, reason) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  const votingContract = new ethers.Contract(
    process.env.VOTING_CONTRACT_ADDRESS,
    SoulvanUpgradeVotingABI,
    signer
  );
  
  const tx = await votingContract.voteOnUpgrade(
    ethers.utils.formatBytes32String(jobId),
    approve,
    reason
  );
  
  await tx.wait();
  return tx.hash;
}
```

### 2. Event Listening for Upgrades

```javascript
// Listen for UpgradeApplied events
votingContract.on("UpgradeApplied", (jobId, approveCount, rejectCount) => {
  console.log(`Job ${jobId} approved with ${approveCount} votes`);
  
  // Trigger render service to apply personalization
  fetch('http://localhost:5200/api/apply-upgrade', {
    method: 'POST',
    body: JSON.stringify({ job_id: ethers.utils.parseBytes32String(jobId) })
  });
});
```

### 3. PostgreSQL Sync

```python
# services/dao-voting/sync-chain-votes.py
from web3 import Web3

def sync_votes_from_chain(job_id):
    """Sync blockchain votes to PostgreSQL"""
    w3 = Web3(Web3.HTTPProvider(os.getenv('ETH_RPC_URL')))
    contract = w3.eth.contract(address=VOTING_CONTRACT, abi=VOTING_ABI)
    
    # Get all votes from chain
    votes = contract.functions.getVotes(Web3.toBytes(text=job_id)).call()
    
    # Store in PostgreSQL
    for vote in votes:
        db.store_vote(
            job_id=job_id,
            voter_wallet=vote['voter'],
            vote='approve' if vote['approve'] else 'reject',
            reason=vote['reason']
        )
```

## Security Considerations

⚠️ **Production Checklist:**

- [ ] Audit contract with professional auditors
- [ ] Add timelocks for upgrade execution
- [ ] Implement vote weight based on token balance (not just binary holding)
- [ ] Add proposal expiration after X blocks
- [ ] Protect against flash loan voting attacks
- [ ] Use OpenZeppelin's Governor pattern for advanced features
- [ ] Add emergency pause functionality
- [ ] Verify SoulvanCoin contract authenticity

## Environment Variables

```bash
# For deployment and integration
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
DEPLOYER_PRIVATE_KEY=0x...
VOTING_CONTRACT_ADDRESS=0x...
SOULVAN_COIN_ADDRESS=0x...
```

## Gas Optimization

Current gas estimates (approximate):
- `createProposal`: ~50k gas
- `voteOnUpgrade`: ~80k gas
- `applyUpgrade`: ~60k gas

**Optimization tips:**
- Use `calldata` instead of `memory` for external functions
- Pack struct variables efficiently
- Batch vote submissions via multicall
- Use events for vote history instead of on-chain arrays

## Related Documentation

- **DAO Voting Service**: `services/dao-voting/README.md` - Off-chain FastAPI layer
- **Database Schema**: `services/clip-provenance/schema.sql` - Vote storage
- **Wallet Creator**: `services/wallet-creator/create_contributor_profile.py` - Generate Ethereum wallets

## License

MIT License - See LICENSE file for details.
