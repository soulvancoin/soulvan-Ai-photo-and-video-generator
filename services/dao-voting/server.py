from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import uuid
from datetime import datetime
import sys
import os

# Add parent directory to path for shared modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'clip-provenance'))
from database import Database

app = FastAPI(
    title="Soulvan DAO Voting API",
    description="Community voting system for render jobs and style upgrades",
    version="1.0.0"
)

db = Database()

# Pydantic models
class JobSubmission(BaseModel):
    scene: str = Field(..., description="Unity scene path")
    camera: str = Field(..., description="Camera GameObject name")
    format: str = Field("EXR", description="Export format (USD/EXR/MP4)")
    wallet: str = Field(..., description="Creator wallet address")
    sign: bool = Field(True, description="Enable provenance signing")
    clip_embed: bool = Field(True, description="Generate CLIP preview")

class VoteSubmission(BaseModel):
    job_id: str = Field(..., description="Job UUID to vote on")
    wallet: str = Field(..., description="Voter wallet address")
    vote: str = Field(..., description="Vote: approve or reject")
    reason: Optional[str] = Field(None, description="Optional vote reason")

class MusicStyleRequest(BaseModel):
    wallet: str
    truck_style: str = Field(..., description="Truck visual style (e.g., graffiti, chrome, matte)")
    mood: str = Field("cinematic", description="Music mood")

class MusicGenerationRequest(BaseModel):
    wallet: str = Field(..., description="Wallet address for personalization")
    truckStyle: str = Field(..., description="Truck style for music mapping")

class ProfileCreationRequest(BaseModel):
    wallet: str = Field(..., description="Ethereum wallet address")
    truck_style: str = Field(..., description="Selected truck visual style")
    preferences: Optional[Dict] = Field(None, description="Additional user preferences")

# Endpoints
@app.post("/api/jobs", status_code=status.HTTP_201_CREATED)
async def submit_job(job: JobSubmission):
    """Submit a new render job"""
    job_id = str(uuid.uuid4())
    
    try:
        db.store_job_metadata(
            job_id=job_id,
            wallet=job.wallet,
            scene=job.scene,
            output=None,  # Will be updated when render completes
            format=job.format,
            score=None,  # Will be set after originality check
            signed_hash=None,
            signature=None
        )
        
        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Job submitted successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit job: {str(e)}"
        )

@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get job status and metadata"""
    job = db.get_job_status(job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return dict(job)

@app.post("/api/vote")
async def submit_vote(vote: VoteSubmission):
    """Submit a DAO vote on a job"""
    # Verify job exists
    job = db.get_job_status(vote.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Validate vote value
    if vote.vote not in ['approve', 'reject']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vote must be 'approve' or 'reject'"
        )
    
    try:
        db.store_vote(
            job_id=vote.job_id,
            wallet=vote.wallet,
            vote=vote.vote,
            reason=vote.reason
        )
        
        # Return updated tally
        tally = db.tally_votes(vote.job_id)
        
        return {
            "message": "Vote recorded",
            "tally": tally
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record vote: {str(e)}"
        )

@app.get("/api/vote/{job_id}")
async def get_votes(job_id: str):
    """Get all votes for a job"""
    try:
        votes = db.get_votes(job_id)
        tally = db.tally_votes(job_id)
        
        return {
            "job_id": job_id,
            "votes": votes,
            "tally": tally
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch votes: {str(e)}"
        )

@app.post("/api/music/style")
async def get_music_style(request: MusicStyleRequest):
    """Map truck style to music genre"""
    style_map = {
        "graffiti": "hip-hop",
        "chrome": "synthwave",
        "matte": "ambient",
        "neon": "synthwave",
        "rust": "industrial",
        "carbon": "electronic",
        "military": "orchestral"
    }
    
    # Find matching style (case-insensitive, partial match)
    truck_lower = request.truck_style.lower()
    genre = "experimental"  # default
    
    for key, value in style_map.items():
        if key in truck_lower:
            genre = value
            break
    
    return {
        "wallet": request.wallet,
        "truck_style": request.truck_style,
        "music_genre": genre,
        "mood": request.mood,
        "suggested_track": f"/tracks/{genre}/{request.mood}/001.mp3"
    }

@app.post("/api/music")
async def generate_music(data: MusicGenerationRequest):
    """
    Generate personalized music track based on wallet and truck style
    Returns a track URL for preview/download
    """
    try:
        # Get music style mapping
        style_map = {
            "graffiti": "hip-hop",
            "chrome": "synthwave",
            "matte": "ambient",
            "mythic": "orchestral",
            "cyberpunk": "industrial",
            "neon": "synthwave",
            "rust": "industrial"
        }
        
        truck_lower = data.truckStyle.lower()
        genre = "experimental"  # default
        
        for key, value in style_map.items():
            if key in truck_lower:
                genre = value
                break
        
        # In production, this would call an AI music generation service
        # For now, return a static track URL based on genre
        track_url = f"https://soulvan-music.s3.amazonaws.com/{genre}/{data.wallet[:8]}.mp3"
        
        # Store preference in database
        try:
            db.store_music_preference(data.wallet, data.truckStyle)
        except Exception as e:
            print(f"Warning: Could not store music preference: {e}")
        
        return {
            "trackUrl": track_url,
            "genre": genre,
            "wallet": data.wallet,
            "truck_style": data.truckStyle
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate music: {str(e)}"
        )

@app.post("/api/profile")
async def create_profile(profile: ProfileCreationRequest):
    """
    Create or update a contributor profile
    Stores wallet address, truck style preference, and metadata
    """
    try:
        # Store profile in music_styles table
        db.store_music_preference(profile.wallet, profile.truck_style)
        
        return {
            "status": "Profile saved",
            "wallet": profile.wallet,
            "truck_style": profile.truck_style,
            "created_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save profile: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "dao-voting"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5300)
