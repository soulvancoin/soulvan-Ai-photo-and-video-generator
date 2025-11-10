"""
Voice Voting Service
Manages voiceover script submissions, community voting, and blockchain integration
Part of Soulvan AI Mythic Loop System
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
import httpx
import asyncio
from datetime import datetime
import os

app = FastAPI(
    title="Voice Voting Service",
    description="Community voiceover voting and approval system",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BLOCKCHAIN_RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "http://localhost:8545")
VOICE_VOTE_CONTRACT = os.getenv("VOICE_VOTE_CONTRACT", "0x...")
IPFS_GATEWAY = os.getenv("IPFS_GATEWAY", "https://ipfs.io/ipfs/")

# Data Models
class ScriptSubmission(BaseModel):
    character: str = Field(..., min_length=1, max_length=100)
    zone: str = Field(..., min_length=1, max_length=100)
    line: str = Field(..., min_length=1, max_length=500)
    author: Optional[str] = None

class Script(BaseModel):
    scriptId: int
    character: str
    zone: str
    line: str
    author: str
    votes: int
    approved: bool
    timestamp: int
    audioUrl: str = ""

class VoteRequest(BaseModel):
    scriptId: int
    voter: str

class AudioSubmission(BaseModel):
    scriptId: int
    audioUrl: str

# In-memory storage (replace with database in production)
scripts_db = {}
votes_db = {}
script_id_counter = 0

@app.on_event("startup")
async def startup_event():
    """Initialize service"""
    print("🎤 Voice Voting Service starting...")
    print(f"📦 Blockchain RPC: {BLOCKCHAIN_RPC_URL}")
    print(f"📝 Contract: {VOICE_VOTE_CONTRACT}")

@app.get("/")
async def root():
    """Service info"""
    return {
        "service": "Voice Voting Service",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "scripts": "/api/voice-vote/scripts",
            "vote": "/api/voice-vote/scripts/{script_id}/vote",
            "audio": "/api/voice-vote/scripts/{script_id}/audio"
        }
    }

@app.post("/api/voice-vote/scripts", response_model=Script)
async def submit_script(
    submission: ScriptSubmission,
    background_tasks: BackgroundTasks
):
    """
    Submit a new voiceover script for community voting
    """
    global script_id_counter
    
    # Create script
    script = Script(
        scriptId=script_id_counter,
        character=submission.character,
        zone=submission.zone,
        line=submission.line,
        author=submission.author or "0x0000000000000000000000000000000000000000",
        votes=0,
        approved=False,
        timestamp=int(datetime.now().timestamp()),
        audioUrl=""
    )
    
    # Store script
    scripts_db[script_id_counter] = script
    votes_db[script_id_counter] = set()
    script_id_counter += 1
    
    # Background: Submit to blockchain
    background_tasks.add_task(submit_to_blockchain, script)
    
    return script

@app.get("/api/voice-vote/scripts", response_model=List[Script])
async def get_scripts(
    status: Optional[str] = None,
    character: Optional[str] = None,
    zone: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Get scripts with optional filters
    - status: 'pending', 'approved', 'all'
    - character: Filter by character name
    - zone: Filter by zone
    """
    scripts = list(scripts_db.values())
    
    # Apply filters
    if status == "pending":
        scripts = [s for s in scripts if not s.approved]
    elif status == "approved":
        scripts = [s for s in scripts if s.approved]
    
    if character:
        scripts = [s for s in scripts if s.character.lower() == character.lower()]
    
    if zone:
        scripts = [s for s in scripts if s.zone.lower() == zone.lower()]
    
    # Sort by votes (descending)
    scripts.sort(key=lambda s: s.votes, reverse=True)
    
    # Pagination
    return scripts[offset:offset + limit]

@app.get("/api/voice-vote/scripts/{script_id}", response_model=Script)
async def get_script(script_id: int):
    """
    Get single script by ID
    """
    if script_id not in scripts_db:
        raise HTTPException(status_code=404, detail="Script not found")
    
    return scripts_db[script_id]

@app.post("/api/voice-vote/scripts/{script_id}/vote")
async def vote_script(
    script_id: int,
    vote_request: VoteRequest,
    background_tasks: BackgroundTasks
):
    """
    Vote for a script
    """
    if script_id not in scripts_db:
        raise HTTPException(status_code=404, detail="Script not found")
    
    script = scripts_db[script_id]
    
    if script.approved:
        raise HTTPException(status_code=400, detail="Script already approved")
    
    # Check if already voted
    if vote_request.voter in votes_db[script_id]:
        raise HTTPException(status_code=400, detail="Already voted for this script")
    
    # Record vote
    votes_db[script_id].add(vote_request.voter)
    script.votes = len(votes_db[script_id])
    
    # Check for approval (10 votes threshold)
    if script.votes >= 10 and not script.approved:
        script.approved = True
        
        # Background: Update blockchain
        background_tasks.add_task(update_blockchain_approval, script_id)
    
    return {
        "status": "success",
        "scriptId": script_id,
        "votes": script.votes,
        "approved": script.approved
    }

@app.post("/api/voice-vote/scripts/{script_id}/audio")
async def submit_audio(
    script_id: int,
    audio: AudioSubmission,
    background_tasks: BackgroundTasks
):
    """
    Submit recorded audio for approved script
    """
    if script_id not in scripts_db:
        raise HTTPException(status_code=404, detail="Script not found")
    
    script = scripts_db[script_id]
    
    if not script.approved:
        raise HTTPException(status_code=400, detail="Script not approved yet")
    
    if script.audioUrl:
        raise HTTPException(status_code=400, detail="Audio already submitted")
    
    # Update audio URL
    script.audioUrl = audio.audioUrl
    
    # Background: Update blockchain
    background_tasks.add_task(submit_audio_to_blockchain, script_id, audio.audioUrl)
    
    return {
        "status": "success",
        "scriptId": script_id,
        "audioUrl": audio.audioUrl
    }

@app.get("/api/voice-vote/scripts/{script_id}/voters")
async def get_voters(script_id: int):
    """
    Get list of voters for a script
    """
    if script_id not in scripts_db:
        raise HTTPException(status_code=404, detail="Script not found")
    
    return {
        "scriptId": script_id,
        "voters": list(votes_db[script_id]),
        "voteCount": len(votes_db[script_id])
    }

@app.get("/api/voice-vote/stats")
async def get_stats():
    """
    Get voting statistics
    """
    total_scripts = len(scripts_db)
    approved_scripts = sum(1 for s in scripts_db.values() if s.approved)
    scripts_with_audio = sum(1 for s in scripts_db.values() if s.audioUrl)
    total_votes = sum(len(voters) for voters in votes_db.values())
    
    return {
        "totalScripts": total_scripts,
        "approvedScripts": approved_scripts,
        "scriptsWithAudio": scripts_with_audio,
        "totalVotes": total_votes,
        "approvalThreshold": 10
    }

@app.get("/api/voice-vote/characters")
async def get_characters():
    """
    Get list of unique characters
    """
    characters = set(s.character for s in scripts_db.values())
    return {
        "characters": sorted(list(characters)),
        "count": len(characters)
    }

@app.get("/api/voice-vote/zones")
async def get_zones():
    """
    Get list of unique zones
    """
    zones = set(s.zone for s in scripts_db.values())
    return {
        "zones": sorted(list(zones)),
        "count": len(zones)
    }

@app.get("/api/voice-vote/leaderboard")
async def get_leaderboard(limit: int = 10):
    """
    Get top voted scripts
    """
    scripts = sorted(
        scripts_db.values(),
        key=lambda s: s.votes,
        reverse=True
    )[:limit]
    
    return {
        "leaderboard": [
            {
                "rank": i + 1,
                "scriptId": s.scriptId,
                "character": s.character,
                "zone": s.zone,
                "votes": s.votes,
                "approved": s.approved
            }
            for i, s in enumerate(scripts)
        ]
    }

# Blockchain integration helpers
async def submit_to_blockchain(script: Script):
    """
    Submit script to blockchain (VoiceVote.sol)
    """
    try:
        # In production, use web3.py or eth-brownie
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BLOCKCHAIN_RPC_URL}/submit",
                json={
                    "contract": VOICE_VOTE_CONTRACT,
                    "function": "submitScript",
                    "params": [script.character, script.zone, script.line]
                }
            )
            print(f"✅ Script {script.scriptId} submitted to blockchain")
    except Exception as e:
        print(f"❌ Blockchain submission failed: {e}")

async def update_blockchain_approval(script_id: int):
    """
    Update script approval status on blockchain
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BLOCKCHAIN_RPC_URL}/approve",
                json={
                    "contract": VOICE_VOTE_CONTRACT,
                    "function": "approveScript",
                    "params": [script_id]
                }
            )
            print(f"✅ Script {script_id} approval updated on blockchain")
    except Exception as e:
        print(f"❌ Blockchain approval update failed: {e}")

async def submit_audio_to_blockchain(script_id: int, audio_url: str):
    """
    Submit audio URL to blockchain
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BLOCKCHAIN_RPC_URL}/audio",
                json={
                    "contract": VOICE_VOTE_CONTRACT,
                    "function": "submitAudio",
                    "params": [script_id, audio_url]
                }
            )
            print(f"✅ Audio URL for script {script_id} submitted to blockchain")
    except Exception as e:
        print(f"❌ Blockchain audio submission failed: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=5600,
        reload=True
    )
