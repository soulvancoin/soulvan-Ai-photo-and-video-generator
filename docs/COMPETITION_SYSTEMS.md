# Soulvan Competition Systems Documentation

Complete guide to the advanced competition features in Soulvan AI.

---

## Table of Contents

1. [Overview](#overview)
2. [Faction Tuning Kits](#faction-tuning-kits)
3. [Mission Replay Tournaments](#mission-replay-tournaments)
4. [Trailer Remix Competitions](#trailer-remix-competitions)
5. [Replay Scoring System](#replay-scoring-system)
6. [DAO Prize Pools](#dao-prize-pools)
7. [CLI Tools](#cli-tools)
8. [Unity Integration](#unity-integration)
9. [React Dashboard](#react-dashboard)
10. [Smart Contracts](#smart-contracts)

---

## Overview

The Soulvan Competition System consists of **5 interconnected features** that enable community-driven content creation, competition, and rewards:

- **Faction Tuning Kits**: Create and share vehicle physics tuning
- **Mission Replay Tournaments**: Submit replays for competitive ranking
- **Trailer Remix Competitions**: Edit and remix official trailers
- **Replay Scoring**: Automated scoring based on performance metrics
- **DAO Prize Pools**: Community-funded prize distribution

### Architecture

```
Smart Contracts (Solidity)
    ↓
Backend Services (Python/Node)
    ↓
CLI Tools (TypeScript) + Unity Scripts (C#) + React UI (JSX)
    ↓
IPFS Storage (Pinata)
```

---

## Faction Tuning Kits

### Overview

Community contributors create vehicle tuning kits specific to their faction. Kits modify:

- **Torque curve** (RPM → Power output)
- **Aerodynamic profile** (Downforce, drag, frontal area)
- **Grip curve** (Speed → Tire grip)

### Creating a Tuning Kit

#### CLI Command

```bash
# Create default kit for faction + vehicle
factiontune NeonReapers SolusGT

# Create custom kit (manual JSON editing)
factiontune ShadowSyndicate PhantomRider --custom
```

#### Kit Structure

```json
{
  "faction": "NeonReapers",
  "vehicle": "SolusGT",
  "torqueMap": [300, 350, 400, 450, 420, 380, ...],
  "aeroProfile": {
    "downforce": 325,
    "dragCoefficient": 0.28,
    "frontalArea": 2.2
  },
  "gripCurve": [1.2, 1.15, 1.1, 0.95, 0.85, ...],
  "contributor": "0x1234...abcd",
  "createdAt": "2025-01-24T12:00:00Z"
}
```

#### Unity Integration

```csharp
// Auto-load tuning for current faction + vehicle
FactionTuner tuner = GetComponent<FactionTuner>();
tuner.faction = "NeonReapers";
tuner.vehicle = "SolusGT";
tuner.LoadAndApplyTuning();

// Manually set tuning kit
TuningKit customKit = ...;
tuner.SetTuningKit(customKit);

// Get tuning stats
string stats = tuner.GetTuningStats();
Debug.Log(stats);
```

### Voting System

- Vote for kits via **React UI** or **CLI**
- Top-voted kits become **Featured** (displayed first)
- Featured kits earn **rewards** via `KitRewards.sol`

**Reward Structure:**
- 1 ETH reward every **10 votes**
- Claimable via `claimReward()` function

---

## Mission Replay Tournaments

### Overview

Players record mission gameplay and submit replays to competitive tournaments. Replays are:

1. Uploaded to **IPFS**
2. Registered on **MissionReplay.sol**
3. Submitted to **ReplayTournament.sol**
4. Auto-featured at **100 views**

### Submitting a Replay

#### CLI Command

```bash
# Submit replay with metadata
replaytourney race_001.mp4 night_chase 8500

# View leaderboard
replaytourney leaderboard night_chase
```

#### Replay Metadata (JSON)

```json
{
  "missionId": "night_chase",
  "duration": 180,
  "completionTime": 162,
  "timestamp": "2025-01-24T12:00:00Z"
}
```

#### Unity Integration

```csharp
// Check for override missions (branching)
OverrideMissionTrigger trigger = GetComponent<OverrideMissionTrigger>();
trigger.missionId = "night_chase";
trigger.CheckForOverrides();

// Accept override mission
trigger.AcceptOverride();

// Propose new override
trigger.ProposeOverride(
  "Speed Run Variant",
  "Complete mission in under 120 seconds",
  "ipfs://Qm..."
);
```

### Tournament Rankings

**Algorithm:**
- Sorted by **score** (highest first)
- Score calculated via `ReplayScoring.sol`
- Top 10 displayed in leaderboard

---

## Trailer Remix Competitions

### Overview

Contributors download official trailers and create remixes with:

- Custom music
- New editing/transitions
- Additional effects

Remixes compete for community votes and DAO prizes.

### Submitting a Remix

#### CLI Command

```bash
# With metadata file
remixpush my_remix.mp4

# Inline metadata
remixpush my_remix.mp4 trailer_001 "Epic Remix" "Custom music and effects"

# Vote for remix
remixpush vote remix_123
```

#### Remix Metadata (JSON)

```json
{
  "originalTrailer": "trailer_001",
  "title": "My Epic Remix",
  "description": "Custom music and cinematic effects",
  "duration": 120,
  "remixer": "0x1234...abcd",
  "createdAt": "2025-01-24T12:00:00Z"
}
```

### Approval Process

- **10 votes** → Remix becomes **APPROVED**
- **50 votes** → Remix becomes **FEATURED**

Featured remixes are:
- Displayed first in UI
- Eligible for **DAO prize pool payouts**

---

## Replay Scoring System

### Overview

Automated scoring based on gameplay metrics:

| Metric       | Multiplier | Description                  |
|--------------|------------|------------------------------|
| Airtime      | ×2         | Total seconds in air         |
| Flips        | ×3         | Complete 360° rotations      |
| Near Misses  | ×5         | < 1m from obstacles          |
| Style Bonus  | +N         | Drift combos, clean racing   |

**Formula:**
```
Total Score = (Airtime × 2) + (Flips × 3) + (Near Misses × 5) + Style Bonus
```

### Calculating Scores

#### CLI Command

```bash
# From metrics file
scorepush night_chase metrics.json

# Inline metrics
scorepush night_chase 12.5 3 8 500

# View leaderboard
scorepush leaderboard night_chase
```

#### Metrics JSON

```json
{
  "airtime": 12.5,
  "flips": 3,
  "nearMisses": 8,
  "styleBonus": 500
}
```

#### Example Calculation

```
Airtime:     12.5s × 2 = 25
Flips:       3 × 3 = 9
Near Misses: 8 × 5 = 40
Style Bonus: 500
─────────────────────
Total Score: 574
```

---

## DAO Prize Pools

### Overview

Community members fund prize pools for competitions. DAO votes determine winner payouts.

### Funding a Pool

#### CLI Command

```bash
# Fund prize pool
prizepush trailer_001 5.0

# Declare winner
prizepush winner trailer_001 0x1234...abcd

# View pool info
prizepush info trailer_001

# List all pools
prizepush list
```

### Prize Distribution (Suggested)

```
Total Pool: 10.0 ETH

1st Place:  5.0 ETH (50%)
2nd Place:  3.0 ETH (30%)
3rd Place:  2.0 ETH (20%)
```

### Smart Contract Flow

```solidity
// Fund pool
fundPool("trailer_001", 5 ether);

// Declare winner (DAO vote required)
declareWinner("trailer_001", winnerAddress);

// Winner claims prize
// (Automatic payout in declareWinner)
```

---

## CLI Tools

### Installation

```bash
cd soulvan-cli/cli
npm install
npm run build
```

### Available Commands

| Command         | Description                          |
|-----------------|--------------------------------------|
| `factiontune`   | Create faction vehicle tuning kits   |
| `replaytourney` | Submit mission replays to tournaments|
| `scorepush`     | Calculate and submit replay scores   |
| `remixpush`     | Submit trailer remixes               |
| `prizepush`     | Fund and manage DAO prize pools      |

### Environment Variables

```bash
# IPFS Upload
export PINATA_API_KEY="your_api_key"
export PINATA_SECRET_KEY="your_secret_key"

# API Endpoints
export TUNING_API_URL="http://localhost:5900/api/tuning"
export REPLAY_API_URL="http://localhost:5800/api/replays"
export TOURNAMENT_API_URL="http://localhost:5800/api/tournaments"
export REMIX_API_URL="http://localhost:5700/api/remixes"
export PRIZE_API_URL="http://localhost:5700/api/prizes"

# Wallet
export WALLET="0x1234567890abcdef..."
```

---

## Unity Integration

### Scripts

| Script                      | Purpose                                   |
|-----------------------------|-------------------------------------------|
| `FactionTuner.cs`           | Load and apply tuning kits to vehicles    |
| `LegendaryGarage.cs`        | Spawn legendary unlocked vehicles         |
| `OverrideMissionTrigger.cs` | Check and activate override missions      |

### FactionTuner Example

```csharp
using UnityEngine;

public class VehicleSetup : MonoBehaviour
{
    void Start()
    {
        FactionTuner tuner = gameObject.AddComponent<FactionTuner>();
        tuner.tuningKitUrl = "http://localhost:5900/api/tuning/kits";
        tuner.faction = "NeonReapers";
        tuner.vehicle = "SolusGT";
        tuner.autoLoadOnStart = true;
        
        // Tuning will auto-load and apply
    }
}
```

### LegendaryGarage Example

```csharp
using UnityEngine;

public class GarageManager : MonoBehaviour
{
    public LegendaryGarage garage;
    
    void Start()
    {
        garage.playerWallet = "0x1234...abcd";
        garage.LoadPlayerProgress();
    }
    
    public void SpawnVehicle(string vehicleId)
    {
        if (garage.IsVehicleUnlocked(vehicleId))
        {
            garage.SpawnVehicle(vehicleId);
        }
        else
        {
            int required = garage.GetRequiredPrestige(vehicleId);
            Debug.Log($"Need {required} prestige to unlock");
        }
    }
}
```

### OverrideMissionTrigger Example

```csharp
using UnityEngine;

public class MissionLoader : MonoBehaviour
{
    public OverrideMissionTrigger trigger;
    
    void Start()
    {
        trigger.missionId = "night_chase";
        trigger.checkOnStart = true;
        trigger.checkInterval = 30f; // Check every 30s
        
        // Will auto-check for overrides
    }
    
    public void VoteForOverride(string overrideMissionId)
    {
        trigger.VoteForOverride(overrideMissionId);
    }
}
```

---

## React Dashboard

### Components

| Component               | Purpose                              |
|-------------------------|--------------------------------------|
| `RemixDashboard.jsx`    | Display top trailer remixes          |
| `TuningLeaderboard.jsx` | Show top faction tuning kits         |
| `OverrideReplayViewer.jsx` | Video player for mission replays  |

### RemixDashboard Example

```jsx
import { RemixDashboard } from './components/RemixDashboard';

function App() {
  return (
    <div className="App">
      <RemixDashboard />
    </div>
  );
}
```

### TuningLeaderboard Example

```jsx
import { TuningLeaderboard } from './components/TuningLeaderboard';

function App() {
  return (
    <div className="App">
      <TuningLeaderboard />
    </div>
  );
}
```

### OverrideReplayViewer Example

```jsx
import { OverrideReplayViewer } from './components/OverrideReplayViewer';

function App() {
  return (
    <div className="App">
      <OverrideReplayViewer />
    </div>
  );
}
```

---

## Smart Contracts

### Contract List

| Contract               | Purpose                                   |
|------------------------|-------------------------------------------|
| `MissionReplay.sol`    | Store and track mission replay videos     |
| `TrailerRemix.sol`     | Trailer remix competition submissions     |
| `TuningLeaderboard.sol`| Track faction vehicle tuning kit submissions |
| `ReplayTournament.sol` | Mission replay tournament rankings        |
| `ReplayScoring.sol`    | Calculate replay scores from metrics     |
| `KitRewards.sol`       | Reward contributors for tuning kit votes  |
| `RemixPrizePool.sol`   | DAO-funded prize pools for remix competitions |

### Key Functions

#### MissionReplay.sol

```solidity
// Register new replay
function registerReplay(
    string memory missionId,
    string memory replayUrl,
    uint256 score
) public;

// Track view (auto-features at 100)
function viewReplay(string memory missionId) public;

// Get replay info
function getReplay(string memory missionId) public view returns (Replay memory);
```

#### TrailerRemix.sol

```solidity
// Submit remix
function submitRemix(
    string memory originalTrailer,
    string memory remixUrl,
    string memory title,
    string memory description
) public;

// Vote for remix
function voteForRemix(string memory remixId) public;

// Get top remixes
function getTopRemixes(string memory trailerId, uint256 limit) public view returns (Remix[] memory);
```

#### TuningLeaderboard.sol

```solidity
// Submit tuning kit
function submitKit(
    string memory faction,
    string memory vehicle,
    string memory url
) public;

// Vote for kit
function voteForKit(string memory kitId) public;

// Get top kits
function getTopKits(string memory faction, uint256 limit) public view returns (Kit[] memory);
```

#### ReplayScoring.sol

```solidity
// Calculate score
function calculateScore(
    uint256 airtime,
    uint256 flips,
    uint256 nearMisses,
    uint256 styleBonus
) public pure returns (uint256);

// Submit score
function submitScore(
    string memory missionId,
    uint256 airtime,
    uint256 flips,
    uint256 nearMisses,
    uint256 styleBonus
) public;
```

#### RemixPrizePool.sol

```solidity
// Fund prize pool
function fundPool(string memory trailerId) public payable;

// Declare winner (DAO vote required)
function declareWinner(
    string memory trailerId,
    address winner
) public;

// Get pool info
function getPrizePool(string memory trailerId) public view returns (PrizePool memory);
```

---

## Complete Workflow Example

### Faction Tuning Kit Workflow

```bash
# 1. Create tuning kit
factiontune NeonReapers SolusGT

# 2. Kit is uploaded to IPFS and registered on blockchain

# 3. In Unity, vehicle loads tuning kit automatically
# FactionTuner.cs applies torque curve, aero profile, grip curve

# 4. Community votes via React UI

# 5. Kit becomes Featured after reaching vote threshold

# 6. Contributor claims rewards from KitRewards.sol
```

### Mission Replay Tournament Workflow

```bash
# 1. Player completes mission and records replay

# 2. Calculate score
scorepush night_chase 12.5 3 8 500
# Output: Total Score: 574

# 3. Submit replay to tournament
replaytourney race_001.mp4 night_chase 574

# 4. Replay uploaded to IPFS and registered

# 5. Community watches replays in OverrideReplayViewer

# 6. Auto-featured at 100 views

# 7. View tournament leaderboard
replaytourney leaderboard night_chase
```

### Trailer Remix Competition Workflow

```bash
# 1. Download official trailer
# (Use IPFS gateway or official download link)

# 2. Create remix with custom editing

# 3. Submit remix
remixpush my_remix.mp4 trailer_001 "Epic Remix" "Custom music"

# 4. Community votes via RemixDashboard

# 5. Approved at 10 votes, Featured at 50 votes

# 6. DAO funds prize pool
prizepush trailer_001 5.0

# 7. DAO votes for winner
prizepush winner trailer_001 0x1234...abcd

# 8. Winner automatically receives payout
```

---

## API Endpoints

### Tuning API (Port 5900)

```
GET  /api/tuning/kits                  - Get all kits
GET  /api/tuning/kits/:faction         - Get faction kits
GET  /api/tuning/kits/:faction/:vehicle - Get specific kit
POST /api/tuning/kits/submit           - Submit new kit
POST /api/tuning/kits/vote/:kitId      - Vote for kit
POST /api/tuning/kits/download/:kitId  - Track download
```

### Replay API (Port 5800)

```
GET  /api/replays/all                  - Get all replays
GET  /api/replays/:missionId           - Get mission replays
POST /api/replays/register             - Register new replay
POST /api/replays/view/:missionId      - Track view

GET  /api/tournaments/entries/:missionId - Get tournament entries
POST /api/tournaments/entries/submit     - Submit tournament entry

GET  /api/scoring/scores/:missionId    - Get mission scores
POST /api/scoring/scores/submit        - Submit score
```

### Remix API (Port 5700)

```
GET  /api/remixes/all                  - Get all remixes
GET  /api/remixes/:trailerId           - Get trailer remixes
POST /api/remixes/submit               - Submit remix
POST /api/remixes/vote/:remixId        - Vote for remix

GET  /api/prizes/all                   - Get all prize pools
GET  /api/prizes/:trailerId            - Get pool info
POST /api/prizes/fund                  - Fund prize pool
POST /api/prizes/declare-winner        - Declare winner
```

---

## Testing

### CLI Testing

```bash
# Test tuning kit creation
factiontune NeonReapers SolusGT

# Test replay submission
replaytourney test_replay.mp4 test_mission 1000

# Test score calculation
scorepush test_mission 10.0 2 5 300

# Test remix submission
remixpush test_remix.mp4 test_trailer "Test" "Testing"

# Test prize pool
prizepush test_trailer 1.0
```

### Unity Testing

```csharp
// Test tuning kit
FactionTuner tuner = GetComponent<FactionTuner>();
tuner.faction = "NeonReapers";
tuner.vehicle = "SolusGT";
tuner.LoadAndApplyTuning();
Debug.Log(tuner.GetTuningStats());

// Test legendary garage
LegendaryGarage garage = GetComponent<LegendaryGarage>();
garage.playerWallet = "0x1234...";
garage.LoadPlayerProgress();

// Test override missions
OverrideMissionTrigger trigger = GetComponent<OverrideMissionTrigger>();
trigger.missionId = "test_mission";
trigger.CheckForOverrides();
```

### React Testing

```jsx
// Test remix dashboard
import { RemixDashboard } from './components/RemixDashboard';
// Visit: http://localhost:3000

// Test tuning leaderboard
import { TuningLeaderboard } from './components/TuningLeaderboard';
// Visit: http://localhost:3000

// Test replay viewer
import { OverrideReplayViewer } from './components/OverrideReplayViewer';
// Visit: http://localhost:3000
```

---

## Troubleshooting

### Common Issues

**CLI: "axios not found"**
```bash
cd soulvan-cli/cli
npm install axios form-data
```

**Unity: "VehiclePhysics component not assigned"**
```csharp
// Create VehiclePhysics component
gameObject.AddComponent<VehiclePhysics>();
```

**React: "Cannot read property 'map' of undefined"**
```jsx
// Check API connection
console.log('REACT_APP_REMIX_API_URL:', process.env.REACT_APP_REMIX_API_URL);
```

**IPFS: "Failed to upload to IPFS"**
```bash
# Check Pinata API keys
echo $PINATA_API_KEY
echo $PINATA_SECRET_KEY
```

---

## Future Enhancements

- [ ] Real-time tournament updates via WebSockets
- [ ] AI-powered scoring suggestions
- [ ] Cross-faction tuning kit collaborations
- [ ] Video editing tools built into CLI
- [ ] Mobile app support
- [ ] VR replay viewing
- [ ] Blockchain gas optimization
- [ ] Multi-chain support (Polygon, Arbitrum)

---

## Support

For issues or questions:

- **GitHub Issues**: [soulvan-ai/issues](https://github.com/soulvan-ai/issues)
- **Discord**: [soulvan-community](https://discord.gg/soulvan)
- **Docs**: [docs.soulvan.ai](https://docs.soulvan.ai)

---

## License

MIT License - See LICENSE file for details

---

**Last Updated**: January 24, 2025  
**Version**: 1.0.0
