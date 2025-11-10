# Mythic Loop System - Complete Integration Guide

## 🌀 Overview

The **Mythic Loop System** creates a continuous feedback loop between **community contributions**, **blockchain governance**, and **in-game experiences** in SoulvanUniverse. This guide covers all three subsystems:

1. **Voiceover Voting System** - Community-driven dialogue creation
2. **Weather-Linked Mission Modifiers** - Dynamic environmental challenges
3. **Faction Legacy Dashboard** - Competitive faction tracking

## 🎭 Voiceover Voting System

### Architecture

```
Contributors → Script Submission → Community Voting → Approval → Voice Recording → Unity Integration
     ↓              ↓                    ↓             ↓             ↓                ↓
  Frontend      VoiceVote.sol      Voice Voting    Smart         IPFS          Game Audio
  (React)       (Ethereum)         Service (API)   Contract                    System
```

### Components

#### 1. Smart Contract: `VoiceVote.sol`

**Location**: `contracts/VoiceVote.sol`

**Key Functions**:
- `submitScript(character, zone, line)` - Submit new voiceover script
- `voteScript(scriptId)` - Vote for a script
- `getScript(scriptId)` - Get script details
- `getApprovedScripts()` - Get all approved scripts
- `submitAudio(scriptId, audioUrl)` - Attach recorded audio

**Approval Logic**:
- Scripts need 10 votes for auto-approval
- One vote per wallet address
- Approved scripts unlock audio submission

**Example**:
```solidity
// Deploy contract
VoiceVote voiceVote = new VoiceVote();

// Submit script
uint256 scriptId = voiceVote.submitScript(
    "Neon Reaper",
    "NeonDistrict",
    "The streets remember everything, kid."
);

// Vote for script
voiceVote.voteScript(scriptId);

// Check approval
(,,,, uint256 votes, bool approved,,) = voiceVote.getScript(scriptId);
```

#### 2. Backend Service: `voice-voting/server.py`

**Location**: `services/voice-voting/server.py`

**Port**: 5600

**Key Endpoints**:
- `POST /api/voice-vote/scripts` - Submit script
- `POST /api/voice-vote/scripts/{id}/vote` - Cast vote
- `GET /api/voice-vote/scripts` - List scripts (with filters)
- `POST /api/voice-vote/scripts/{id}/audio` - Submit audio
- `GET /api/voice-vote/stats` - Get voting statistics

**Features**:
- FastAPI for high performance
- Async blockchain integration
- IPFS audio storage
- Real-time vote tracking
- Automatic approval at threshold

**Run**:
```bash
cd services/voice-voting
pip install -r requirements.txt
python server.py
```

#### 3. Frontend Component: `VoiceVotePanel.jsx`

**Location**: `services/dashboard/components/VoiceVotePanel.jsx`

**Features**:
- Script submission form
- Pending scripts list with vote buttons
- Approved scripts display
- Audio playback for recorded lines
- Real-time vote count updates

**Usage**:
```jsx
import VoiceVotePanel from '@/components/VoiceVotePanel';

// Show all scripts
<VoiceVotePanel />

// Show specific script
<VoiceVotePanel scriptId={42} />
```

#### 4. Unity Integration: `VoiceVotingClient.cs`

**Create**: `unity/Assets/Scripts/VoiceVotingClient.cs`

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class VoiceVotingClient : MonoBehaviour
{
    private string apiUrl = "http://localhost:5600/api/voice-vote";
    
    public IEnumerator LoadApprovedScripts()
    {
        using (UnityWebRequest request = UnityWebRequest.Get($"{apiUrl}/scripts?status=approved"))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                // Parse and load audio clips
                string json = request.downloadHandler.text;
                ProcessScripts(json);
            }
        }
    }
    
    void ProcessScripts(string json)
    {
        // Load audio from IPFS URLs
        // Assign to character audio sources
        // Build dialogue system
    }
}
```

### Workflow

1. **Contributor writes dialogue** → React frontend
2. **Submit to blockchain** → VoiceVote.sol stores script
3. **Community votes** → 10 votes = auto-approval
4. **Voice actor records** → Upload to IPFS
5. **Submit audio URL** → Stored on blockchain
6. **Unity loads audio** → Approved scripts with audio integrated into game
7. **Players hear voiceovers** → In cinematic missions and NPCs

---

## 🌦️ Weather-Linked Mission Modifiers

### Architecture

```
Real Weather API → Weather Service → Unity Weather Modifier → Mission Parameters
       ↓                 ↓                    ↓                       ↓
   OpenWeather      weather API        C# Component            Difficulty↑
   AccuWeather      (Python/Node)      (Unity)                 Handling↓
                                                               Visibility↓
```

### Components

#### 1. Unity Script: `MissionWeatherModifier.cs`

**Location**: `unity/Assets/Scripts/MissionWeatherModifier.cs`

**Responsibilities**:
- Fetch weather data from API
- Calculate mission modifiers based on conditions
- Apply visual weather effects
- Update mission UI

**Weather Conditions**:
- ☀️ **Clear**: Normal parameters
- ☔ **Rain**: +30% difficulty, -15% vehicle handling, -20% visibility
- ❄️ **Snow**: +50% difficulty, -30% vehicle handling, -40% visibility
- 🌫️ **Fog**: -60% visibility, -30% enemy awareness (stealth bonus)
- ⛈️ **Storm**: +80% difficulty, -40% vehicle handling, -50% visibility
- 🌙 **Night**: +20% difficulty, -50% visibility, -15% enemy awareness

**Usage**:
```csharp
// Attach to mission GameObject
public class ExampleMission : MonoBehaviour
{
    public MissionWeatherModifier weatherModifier;
    public Mission mission;
    
    void Start()
    {
        weatherModifier.zone = "NeonDistrict";
        weatherModifier.mission = mission;
        // Weather automatically fetched and applied
    }
}
```

#### 2. Weather Effects Manager: `WeatherEffectsManager.cs`

**Location**: `unity/Assets/Scripts/WeatherEffectsManager.cs`

**Responsibilities**:
- Control particle systems (rain, snow, fog)
- Adjust lighting (sun, moon, storms)
- Change skybox dynamically
- Set fog density

**Setup**:
1. Create particle systems for each weather type
2. Assign materials for skyboxes
3. Reference directional light
4. Attach script to scene manager

#### 3. Mission UI: `MissionUI.cs`

**Location**: `unity/Assets/Scripts/MissionUI.cs`

**Features**:
- Weather condition display with emojis
- Temperature and wind speed
- Modifier multipliers with color coding
- Real-time updates

#### 4. CLI Tool: `weathermod` (TypeScript)

**Location**: `soulvan-cli/cli/src/commands/weathermod.ts`

**Usage**:
```bash
# Apply weather modifiers to mission
weathermod NeonDistrict mission_001

# Output:
# 🌦️  Applying weather modifiers to mission_001 in NeonDistrict...
# ☔ RAIN
# 🌡️  Temperature: 15.2°C
# 💨 Wind Speed: 8.5 m/s
# 
# Mission Modifiers:
# ▲ Difficulty: x1.30 (+30%)
# ▼ Vehicle Handling: x0.85 (-15%)
# ▼ Visibility: x0.80 (-20%)
```

### Weather API Service

**Create**: `services/weather-api/server.py`

```python
from fastapi import FastAPI
import httpx
import os

app = FastAPI()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

@app.get("/api/weather")
async def get_weather(zone: str):
    # Map zones to real-world locations
    location_map = {
        "NeonDistrict": "Tokyo,JP",
        "IndustrialBay": "Detroit,US",
        "ShadowQuarter": "London,UK"
    }
    
    location = location_map.get(zone, "New York,US")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.openweathermap.org/data/2.5/weather",
            params={
                "q": location,
                "appid": OPENWEATHER_API_KEY,
                "units": "metric"
            }
        )
        data = response.json()
        
    # Convert to game weather format
    return {
        "condition": map_weather_condition(data["weather"][0]["main"]),
        "temperature": data["main"]["temp"],
        "windSpeed": data["wind"]["speed"],
        "humidity": data["main"]["humidity"],
        "visibility": data.get("visibility", 10000),
        "isNight": is_night_time(data),
        "precipitation": data.get("rain", {}).get("1h", 0)
    }
```

### Integration Steps

1. **Deploy Weather API** → Python service on port 5500
2. **Configure Unity scene** → Add MissionWeatherModifier to missions
3. **Set up particle systems** → Rain, snow, fog effects
4. **Test with CLI** → `weathermod NeonDistrict mission_001`
5. **Play mission** → Weather dynamically affects gameplay

---

## 🏆 Faction Legacy Dashboard

### Architecture

```
Faction Actions → Smart Contract → Backend Service → React Dashboard → Leaderboard
      ↓               ↓                  ↓                  ↓              ↓
  Zone Capture   FactionLegacy.sol   Faction API      Components    Competition
  Missions       (Blockchain)        (FastAPI)        (React)
  Lore Approval
```

### Components

#### 1. Smart Contract: `FactionLegacy.sol`

**Location**: `contracts/FactionLegacy.sol`

**Key Functions**:
- `createFaction(name)` - Create new faction
- `captureZone(zone, faction)` - Record zone capture
- `recordMissionCompletion(faction)` - +10 prestige
- `recordLoreApproval(faction)` - +50 prestige
- `unlockAchievement(faction, name, description, prestige)` - Achievements
- `getLegacy(faction)` - Get faction stats
- `getTopFactions(limit)` - Leaderboard

**Prestige Formula**:
```
Prestige = (Zones × 100) + (Missions × 10) + (Lore × 50) + Achievements
```

**Example**:
```solidity
FactionLegacy legacy = new FactionLegacy();

// Create faction
legacy.createFaction("Neon Reapers");

// Record actions
legacy.captureZone("NeonDistrict", "Neon Reapers");  // +100 prestige
legacy.recordMissionCompletion("Neon Reapers");      // +10 prestige
legacy.recordLoreApproval("Neon Reapers");           // +50 prestige

// Unlock achievement
legacy.unlockAchievement(
    "Neon Reapers",
    "First Blood",
    "Captured first zone",
    250  // +250 prestige bonus
);

// Check stats
(uint256 zones, uint256 missions, uint256 lore, uint256 prestige,,) = 
    legacy.getFactionStats("Neon Reapers");
```

#### 2. Backend Service: `faction-legacy/server.py`

**Create**: `services/faction-legacy/server.py`

```python
from fastapi import FastAPI
from web3 import Web3

app = FastAPI()

# Web3 connection
w3 = Web3(Web3.HTTPProvider("http://localhost:8545"))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

@app.get("/api/faction-legacy/factions/{faction}")
async def get_faction(faction: str):
    legacy = contract.functions.getLegacy(faction).call()
    return {
        "faction": legacy[0],
        "zonesControlled": legacy[1],
        "missionsCompleted": legacy[2],
        "loreApproved": legacy[3],
        "prestigePoints": legacy[4],
        "memberCount": legacy[5],
        "leader": legacy[6],
        "foundedTimestamp": legacy[7],
        "active": legacy[8]
    }

@app.get("/api/faction-legacy/factions/{faction}/zones")
async def get_faction_zones(faction: str):
    zones = contract.functions.getFactionZones(faction).call()
    return [{"name": zone} for zone in zones]

@app.get("/api/faction-legacy/leaderboard")
async def get_leaderboard(limit: int = 10):
    (factions, prestige) = contract.functions.getTopFactions(limit).call()
    return [
        {
            "faction": factions[i],
            "prestigePoints": prestige[i],
            "rank": i + 1
        }
        for i in range(len(factions))
    ]
```

#### 3. Frontend Component: `FactionDashboard.jsx`

**Location**: `services/dashboard/components/FactionDashboard.jsx`

**Features**:
- Prestige points display
- Leaderboard ranking
- Controlled zones map
- Mission/lore statistics
- Achievements gallery
- Member count

**Usage**:
```jsx
import FactionDashboard from '@/components/FactionDashboard';

<FactionDashboard faction="Neon Reapers" />
```

#### 4. Unity Integration: `FactionTracker.cs`

**Create**: `unity/Assets/Scripts/FactionTracker.cs`

```csharp
public class FactionTracker : MonoBehaviour
{
    private string apiUrl = "http://localhost:5700/api/faction-legacy";
    
    public IEnumerator RecordZoneCapture(string zone, string faction)
    {
        string json = JsonUtility.ToJson(new {
            zone = zone,
            faction = faction
        });
        
        using (UnityWebRequest request = UnityWebRequest.Post(
            $"{apiUrl}/zones/capture", json, "application/json"))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log($"Zone {zone} captured by {faction}");
                ShowCaptureAnimation(zone, faction);
            }
        }
    }
    
    void ShowCaptureAnimation(string zone, string faction)
    {
        // Display faction banner
        // Play victory sound
        // Update minimap colors
    }
}
```

### Achievements System

**Predefined Achievements**:

| Achievement | Requirement | Prestige |
|-------------|-------------|----------|
| **First Blood** | Capture first zone | 250 |
| **Territorial** | Control 5 zones | 500 |
| **Empire Builder** | Control 10 zones | 1000 |
| **Mission Master** | Complete 50 missions | 500 |
| **Century Club** | Complete 100 missions | 1000 |
| **Lorekeeper** | 10 lore approvals | 750 |
| **Mythic Scribe** | 25 lore approvals | 1500 |
| **Community Leader** | 100 faction members | 1000 |

**Unlock in Unity**:
```csharp
IEnumerator UnlockAchievement(string faction, string name, string desc, int prestige)
{
    string json = JsonUtility.ToJson(new {
        faction = faction,
        name = name,
        description = desc,
        prestigeReward = prestige
    });
    
    using (UnityWebRequest request = UnityWebRequest.Post(
        $"{apiUrl}/achievements/unlock", json, "application/json"))
    {
        yield return request.SendWebRequest();
        
        if (request.result == UnityWebRequest.Result.Success)
        {
            ShowAchievementPopup(name, prestige);
        }
    }
}
```

---

## 🔄 Complete Mythic Loop Flow

### 1. Community Contribution Phase

```
Player writes voiceover line
  → Submit to VoiceVote.sol
  → Community votes (needs 10 votes)
  → Auto-approved
  → Voice actor records
  → Upload to IPFS
  → Audio URL stored on blockchain
```

### 2. Content Integration Phase

```
Unity loads approved scripts
  → Download audio from IPFS
  → Integrate into dialogue system
  → Assign to NPCs and cinematics
  → Players experience community content
```

### 3. Dynamic Gameplay Phase

```
Real-time weather API
  → Weather data for zone
  → Unity calculates modifiers
  → Mission difficulty adjusted
  → Visual effects applied
  → Player experiences realistic conditions
```

### 4. Faction Competition Phase

```
Faction completes mission
  → Record on FactionLegacy.sol
  → +10 prestige points
  → Check for achievement unlocks
  → Update leaderboard
  → React dashboard shows new ranking
```

### 5. Legacy Recognition Phase

```
View Faction Dashboard
  → See prestige ranking
  → Zones controlled map
  → Achievement gallery
  → Compare with rivals
  → Motivates continued engagement
```

---

## 📊 System Integration Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MYTHIC LOOP SYSTEM                            │
│                                                                  │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │  Community  │───▶│  Blockchain  │───▶│  Unity Engine   │   │
│  │             │    │              │    │                 │   │
│  │ • Submit    │    │ • VoiceVote  │    │ • Audio System  │   │
│  │ • Vote      │    │ • Faction    │    │ • Weather Mod   │   │
│  │ • Record    │    │   Legacy     │    │ • Faction UI    │   │
│  └─────────────┘    └──────────────┘    └─────────────────┘   │
│         │                   │                     │             │
│         ▼                   ▼                     ▼             │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │   React     │    │  Backend     │    │  Weather API    │   │
│  │  Frontend   │◀───│  Services    │◀───│  (OpenWeather)  │   │
│  │             │    │              │    │                 │   │
│  │ • Vote UI   │    │ • Voice API  │    │ • Real-time     │   │
│  │ • Dashboard │    │ • Faction API│    │   conditions    │   │
│  │ • Stats     │    │ • Weather    │    │                 │   │
│  └─────────────┘    └──────────────┘    └─────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Checklist

### Blockchain

- [ ] Deploy VoiceVote.sol to testnet/mainnet
- [ ] Deploy FactionLegacy.sol to testnet/mainnet
- [ ] Verify contracts on Etherscan
- [ ] Fund deployer wallet with gas
- [ ] Test all contract functions

### Backend Services

- [ ] Deploy voice-voting service (port 5600)
- [ ] Deploy faction-legacy service (port 5700)
- [ ] Deploy weather-api service (port 5500)
- [ ] Set environment variables
- [ ] Configure CORS origins
- [ ] Set up monitoring (Datadog, Sentry)

### Frontend

- [ ] Build React dashboard
- [ ] Deploy to Vercel/Netlify
- [ ] Configure API endpoints
- [ ] Test wallet connection
- [ ] Enable HTTPS

### Unity

- [ ] Add MissionWeatherModifier to scenes
- [ ] Set up particle systems
- [ ] Configure API URLs
- [ ] Test weather integration
- [ ] Test voice audio loading
- [ ] Test faction tracking

### APIs

- [ ] Get OpenWeather API key
- [ ] Configure rate limits
- [ ] Set up fallback weather data
- [ ] Test IPFS uploads
- [ ] Configure Pinata/Infura

---

## 🎮 Player Experience

### Community Member Journey

1. **Submit voiceover script** → "The streets remember everything"
2. **Rally community** → Share on Discord/Twitter
3. **Hit 10 votes** → Script approved! 🎉
4. **Record audio** → Professional or AI voice
5. **Upload to IPFS** → Permanent storage
6. **Submit URL** → Stored on blockchain
7. **Play game** → Hear YOUR dialogue in missions
8. **Earn reputation** → NFT badge for contributions

### Faction Member Journey

1. **Join faction** → "Neon Reapers"
2. **Complete missions** → +10 prestige each
3. **Capture zones** → +100 prestige, territory control
4. **Submit lore** → +50 prestige when approved
5. **Unlock achievements** → Bonus prestige
6. **Check leaderboard** → Rank #3 globally
7. **View dashboard** → See faction legacy
8. **Compete** → Push for #1 ranking

### Mission Player Journey

1. **Select mission** → "Heist in Neon District"
2. **Check weather** → Raining ☔ (+30% difficulty)
3. **Adapt strategy** → Stealth approach due to fog
4. **Experience modifiers** → Slippery roads, low visibility
5. **Hear voiceovers** → Community-created dialogue
6. **Complete mission** → Faction prestige +10
7. **View dashboard** → See impact on leaderboard

---

## 🔧 Configuration Files

### Voice Voting Service `.env`

```bash
# services/voice-voting/.env
BLOCKCHAIN_RPC_URL=http://localhost:8545
VOICE_VOTE_CONTRACT=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

### Weather API `.env`

```bash
# services/weather-api/.env
OPENWEATHER_API_KEY=your_openweather_key
ACCUWEATHER_API_KEY=your_accuweather_key
PORT=5500
```

### Unity `.env` (via PlayerPrefs or config file)

```json
{
  "voiceVotingAPI": "http://localhost:5600/api/voice-vote",
  "factionLegacyAPI": "http://localhost:5700/api/faction-legacy",
  "weatherAPI": "http://localhost:5500/api/weather"
}
```

---

## 📈 Metrics & Analytics

### Voice Voting

- Total scripts submitted
- Approval rate
- Average votes per script
- Top contributors
- Scripts with audio
- Most popular characters/zones

### Weather System

- API call frequency
- Weather distribution (clear/rain/snow/etc)
- Impact on mission completion rates
- Player adaptations

### Faction Legacy

- Active factions
- Prestige distribution
- Zone control heatmap
- Mission completion rates
- Lore approval rates
- Achievement unlock rates

---

## 🐛 Troubleshooting

### Voice Voting Issues

**"Script submission failed"**
- Check wallet connection
- Verify gas funds
- Check character/zone/line length limits

**"Votes not counting"**
- Ensure one vote per wallet
- Check if script already approved
- Verify contract interaction

### Weather Issues

**"Weather not updating"**
- Check API key validity
- Verify internet connection
- Check rate limits
- Use fallback data

**"Visual effects not showing"**
- Verify particle systems assigned
- Check WeatherEffectsManager setup
- Review console for errors

### Faction Issues

**"Prestige not updating"**
- Check blockchain transaction status
- Verify contract address
- Check gas price

**"Dashboard not loading"**
- Verify API endpoint URLs
- Check CORS configuration
- Review network tab for errors

---

## 🎓 Best Practices

### For Contributors

- ✅ Write authentic, character-appropriate dialogue
- ✅ Keep lines under 500 characters
- ✅ Vote for quality content
- ✅ Record professional audio
- ✅ Use proper IPFS storage

### For Developers

- ✅ Handle API failures gracefully
- ✅ Cache weather data (5-minute intervals)
- ✅ Validate all blockchain inputs
- ✅ Use environment variables for secrets
- ✅ Monitor API rate limits
- ✅ Log all important events

### For Faction Leaders

- ✅ Coordinate mission campaigns
- ✅ Engage community for votes
- ✅ Submit quality lore content
- ✅ Track leaderboard changes
- ✅ Celebrate achievements

---

## 📚 Additional Resources

- [VoiceVote.sol Contract Source](../../contracts/VoiceVote.sol)
- [FactionLegacy.sol Contract Source](../../contracts/FactionLegacy.sol)
- [Weather Modifier Unity Script](../../unity/Assets/Scripts/MissionWeatherModifier.cs)
- [Voice Voting Service API](../../services/voice-voting/README.md)
- [CLI Weather Tool](../../soulvan-cli/cli/src/commands/weathermod.ts)

---

**Made with ❤️ by the Soulvan Community**

*Mythic Loop: Where community creativity meets immersive gameplay*
