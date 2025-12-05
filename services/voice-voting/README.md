# Voice Voting Service

Community-driven voiceover script submission and voting system with blockchain integration.

## 🎤 Features

- **Script Submission**: Contributors submit character dialogue
- **Community Voting**: Token holders vote for scripts
- **Auto-Approval**: Scripts with 10+ votes are automatically approved
- **Audio Recording**: Approved scripts can have audio recordings attached
- **Blockchain Integration**: All data synced to VoiceVote.sol smart contract
- **IPFS Storage**: Audio files stored on IPFS for decentralization

## 🚀 Quick Start

### Installation

```bash
cd services/voice-voting
pip install -r requirements.txt
```

### Run Server

```bash
python server.py
```

Server runs on `http://localhost:5600`

### Environment Variables

```bash
export BLOCKCHAIN_RPC_URL="http://localhost:8545"
export VOICE_VOTE_CONTRACT="0x..."
export IPFS_GATEWAY="https://ipfs.io/ipfs/"
```

## 📡 API Endpoints

### Submit Script

```bash
POST /api/voice-vote/scripts
Content-Type: application/json

{
  "character": "Neon Reaper",
  "zone": "NeonDistrict",
  "line": "The streets remember everything, kid. Every deal, every betrayal."
}
```

### Vote for Script

```bash
POST /api/voice-vote/scripts/1/vote
Content-Type: application/json

{
  "scriptId": 1,
  "voter": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Get Scripts

```bash
# All scripts
GET /api/voice-vote/scripts

# Pending approval
GET /api/voice-vote/scripts?status=pending

# Approved only
GET /api/voice-vote/scripts?status=approved

# Filter by character
GET /api/voice-vote/scripts?character=NeonReaper

# Filter by zone
GET /api/voice-vote/scripts?zone=NeonDistrict
```

### Submit Audio

```bash
POST /api/voice-vote/scripts/1/audio
Content-Type: application/json

{
  "scriptId": 1,
  "audioUrl": "ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

### Get Statistics

```bash
GET /api/voice-vote/stats
```

Response:
```json
{
  "totalScripts": 150,
  "approvedScripts": 45,
  "scriptsWithAudio": 32,
  "totalVotes": 678,
  "approvalThreshold": 10
}
```

### Get Leaderboard

```bash
GET /api/voice-vote/leaderboard?limit=10
```

## 🎭 Usage Examples

### Python

```python
import httpx

# Submit script
async def submit_script():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:5600/api/voice-vote/scripts",
            json={
                "character": "Zone Commander",
                "zone": "IndustrialBay",
                "line": "All units, we have a situation in sector 7."
            }
        )
        print(response.json())

# Vote for script
async def vote_script(script_id: int, voter: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://localhost:5600/api/voice-vote/scripts/{script_id}/vote",
            json={"scriptId": script_id, "voter": voter}
        )
        print(response.json())
```

### JavaScript

```javascript
// Submit script
async function submitScript() {
  const response = await fetch('http://localhost:5600/api/voice-vote/scripts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      character: 'Shadow Operative',
      zone: 'ShadowQuarter',
      line: 'Target acquired. Moving in.'
    })
  });
  const data = await response.json();
  console.log(data);
}

// Vote for script
async function voteScript(scriptId, voter) {
  const response = await fetch(
    `http://localhost:5600/api/voice-vote/scripts/${scriptId}/vote`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptId, voter })
    }
  );
  const data = await response.json();
  console.log(data);
}
```

### cURL

```bash
# Submit script
curl -X POST http://localhost:5600/api/voice-vote/scripts \
  -H "Content-Type: application/json" \
  -d '{
    "character": "Street Vendor",
    "zone": "MarketDistrict",
    "line": "Fresh tech, best prices in the zone!"
  }'

# Vote
curl -X POST http://localhost:5600/api/voice-vote/scripts/1/vote \
  -H "Content-Type: application/json" \
  -d '{
    "scriptId": 1,
    "voter": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

## 🔗 Integration

### With Unity

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class VoiceVotingClient : MonoBehaviour
{
    private string apiUrl = "http://localhost:5600/api/voice-vote";

    IEnumerator SubmitScript(string character, string zone, string line)
    {
        string json = JsonUtility.ToJson(new {
            character = character,
            zone = zone,
            line = line
        });

        using (UnityWebRequest request = UnityWebRequest.Post($"{apiUrl}/scripts", json, "application/json"))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Script submitted: " + request.downloadHandler.text);
            }
        }
    }
}
```

### With React

```jsx
import { useState } from 'react';
import { VoiceVotePanel } from '@/components/VoiceVotePanel';

export default function VotingPage() {
  const [selectedScript, setSelectedScript] = useState(null);

  return (
    <div>
      <h1>Community Voiceover Voting</h1>
      <VoiceVotePanel scriptId={selectedScript} />
    </div>
  );
}
```

## 🎮 Workflow

1. **Contributor submits script** → POST /api/voice-vote/scripts
2. **Community votes** → POST /api/voice-vote/scripts/{id}/vote
3. **Auto-approval at 10 votes** → Script marked as approved
4. **Voice actor records audio** → Upload to IPFS
5. **Audio submission** → POST /api/voice-vote/scripts/{id}/audio
6. **Integration with game** → Unity loads approved audio

## 📊 Data Model

```python
class Script:
    scriptId: int          # Unique identifier
    character: str         # Character name
    zone: str             # Zone/location
    line: str             # Voice line text (max 500 chars)
    author: str           # Wallet address of submitter
    votes: int            # Total votes
    approved: bool        # Approval status
    timestamp: int        # Submission time (Unix)
    audioUrl: str         # IPFS URL (if recorded)
```

## 🔐 Security

- Scripts limited to 500 characters
- One vote per wallet address per script
- Approval threshold: 10 votes (configurable)
- Audio submission restricted to script author
- All data backed up to blockchain

## 📈 Future Enhancements

- [ ] Token-gated voting (require $SOUL stake)
- [ ] Voice actor reputation system
- [ ] AI-generated voice synthesis option
- [ ] Multi-language support
- [ ] Script quality scoring
- [ ] Automated profanity filtering
- [ ] NFT badges for contributors

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5600
lsof -ti:5600 | xargs kill -9
```

### Blockchain connection failed
```bash
# Check RPC URL
curl $BLOCKCHAIN_RPC_URL

# Restart local blockchain
ganache-cli -p 8545
```

## 📝 License

MIT License - See LICENSE file

---

**Made with ❤️ by the Soulvan Community**
