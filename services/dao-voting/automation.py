#!/usr/bin/env python3
"""
Soulvan Job Automation Utilities
Helper functions for automated job submission, rendering, and music preview
"""

import requests
import sys
import os
from typing import Optional

# Add parent directory to path for database access
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'clip-provenance'))
from database import Database

# Configuration
CLIP_SERVICE_URL = os.getenv('CLIP_SERVICE_URL', 'http://localhost:5200')
DAO_SERVICE_URL = os.getenv('DAO_SERVICE_URL', 'http://localhost:5300')
UNITY_RENDER_COMMAND = os.getenv('UNITY_RENDER_COMMAND', 'soulvan job:run')

db = Database()


def auto_submit_job(
    wallet: str,
    truck_style: str,
    scene: str,
    camera: str = "MainCamera",
    format: str = "EXR",
    sign: bool = True,
    clip_embed: bool = True
) -> str:
    """
    Automated job submission workflow
    
    1. Submit job to DAO service
    2. Generate S3 output path based on wallet
    3. Trigger render via CLI
    4. Return job_id for tracking
    
    Args:
        wallet: Ethereum wallet address
        truck_style: Visual style for personalization
        scene: Unity scene path
        camera: Camera GameObject name
        format: Export format (USD/EXR/MP4)
        sign: Enable provenance signing
        clip_embed: Generate CLIP embedding
        
    Returns:
        job_id: UUID of submitted job
        
    Example:
        >>> job_id = auto_submit_job(
        ...     wallet="0x742d35Cc...",
        ...     truck_style="graffiti",
        ...     scene="Assets/Scenes/cinematic_main.unity"
        ... )
        >>> print(f"Job submitted: {job_id}")
    """
    # Construct output path
    output_path = f"s3://soulvan-renders/{wallet}/"
    
    # Submit job via API
    response = requests.post(
        f"{DAO_SERVICE_URL}/api/jobs",
        json={
            "scene": scene,
            "camera": camera,
            "format": format,
            "wallet": wallet,
            "sign": sign,
            "clip_embed": clip_embed
        }
    )
    response.raise_for_status()
    
    job_data = response.json()
    job_id = job_data['job_id']
    
    print(f"✅ Job submitted: {job_id}")
    print(f"📁 Output path: {output_path}")
    print(f"🎨 Truck style: {truck_style}")
    
    # Trigger render (optional - can be done by external worker)
    try:
        trigger_render(job_id, scene, output_path)
    except Exception as e:
        print(f"⚠️  Render trigger failed (manual trigger required): {e}")
    
    return job_id


def trigger_render(job_id: str, scene: str, output_path: str) -> None:
    """
    Trigger Unity render via CLI or job queue
    
    In production, this would:
    1. Submit to render farm queue (RabbitMQ/Celery)
    2. Spawn headless Unity process
    3. Monitor progress and update database
    
    Args:
        job_id: UUID of the job
        scene: Unity scene path
        output_path: S3/local output directory
    """
    print(f"🚀 Triggering render for job {job_id}")
    print(f"   Scene: {scene}")
    print(f"   Output: {output_path}")
    
    # In production, submit to job queue:
    # celery_app.send_task('render_job', args=[job_id, scene, output_path])
    
    # For now, just log the action
    print("⏳ Render job queued (implement Celery/RabbitMQ for production)")


def trigger_music_preview(wallet: str, truck_style: str) -> str:
    """
    Generate and preview music track for given wallet and style
    
    Args:
        wallet: Ethereum wallet address
        truck_style: Truck visual style (graffiti, chrome, etc.)
        
    Returns:
        track_url: URL to preview audio file
        
    Example:
        >>> track_url = trigger_music_preview("0x742d35Cc...", "graffiti")
        >>> print(f"Preview your track: {track_url}")
    """
    try:
        response = requests.post(
            f"{DAO_SERVICE_URL}/api/music",
            json={"wallet": wallet, "truckStyle": truck_style}
        )
        response.raise_for_status()
        
        data = response.json()
        track_url = data['trackUrl']
        genre = data.get('genre', 'unknown')
        
        print(f"🎵 Music generated!")
        print(f"   Wallet: {wallet[:10]}...")
        print(f"   Style: {truck_style} → Genre: {genre}")
        print(f"   Preview: {track_url}")
        
        return track_url
        
    except Exception as e:
        print(f"❌ Music generation failed: {e}")
        raise


def get_music_style(wallet: str, truck_style: str) -> str:
    """
    Get music genre for given truck style
    
    Args:
        wallet: Ethereum wallet address
        truck_style: Truck visual style
        
    Returns:
        genre: Music genre string
    """
    style_map = {
        "graffiti": "hip-hop",
        "chrome": "synthwave",
        "matte": "ambient",
        "mythic": "orchestral",
        "cyberpunk": "industrial",
        "neon": "synthwave",
        "rust": "industrial",
        "carbon": "electronic",
        "military": "orchestral"
    }
    
    truck_lower = truck_style.lower()
    
    for key, value in style_map.items():
        if key in truck_lower:
            return value
    
    return "experimental"


def create_profile_and_submit_job(
    wallet: str,
    truck_style: str,
    scene: str,
    camera: str = "MainCamera"
) -> dict:
    """
    Complete onboarding workflow: create profile + submit first job
    
    Args:
        wallet: Ethereum wallet address
        truck_style: Selected truck visual style
        scene: Unity scene to render
        camera: Camera name
        
    Returns:
        dict with profile and job_id
        
    Example:
        >>> result = create_profile_and_submit_job(
        ...     wallet="0x742d35Cc...",
        ...     truck_style="graffiti",
        ...     scene="Assets/Scenes/cinematic_main.unity"
        ... )
        >>> print(result['job_id'])
    """
    print("=" * 60)
    print("🎬 SOULVAN COMPLETE WORKFLOW")
    print("=" * 60)
    
    # Step 1: Create profile
    print("\n1️⃣ Creating profile...")
    profile_response = requests.post(
        f"{DAO_SERVICE_URL}/api/profile",
        json={"wallet": wallet, "truck_style": truck_style}
    )
    profile_response.raise_for_status()
    print(f"   ✅ Profile created for {wallet[:10]}...")
    
    # Step 2: Submit job
    print("\n2️⃣ Submitting render job...")
    job_id = auto_submit_job(
        wallet=wallet,
        truck_style=truck_style,
        scene=scene,
        camera=camera
    )
    
    # Step 3: Generate music preview
    print("\n3️⃣ Generating music preview...")
    try:
        track_url = trigger_music_preview(wallet, truck_style)
    except Exception as e:
        print(f"   ⚠️  Music generation skipped: {e}")
        track_url = None
    
    print("\n" + "=" * 60)
    print("✅ WORKFLOW COMPLETE")
    print("=" * 60)
    
    return {
        "wallet": wallet,
        "truck_style": truck_style,
        "job_id": job_id,
        "track_url": track_url,
        "status": "success"
    }


# CLI interface for testing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Soulvan Job Automation")
    parser.add_argument("--wallet", required=True, help="Ethereum wallet address")
    parser.add_argument("--style", required=True, help="Truck style")
    parser.add_argument("--scene", required=True, help="Unity scene path")
    parser.add_argument("--camera", default="MainCamera", help="Camera name")
    parser.add_argument("--full-workflow", action="store_true", 
                       help="Run complete profile + job + music workflow")
    
    args = parser.parse_args()
    
    if args.full_workflow:
        result = create_profile_and_submit_job(
            wallet=args.wallet,
            truck_style=args.style,
            scene=args.scene,
            camera=args.camera
        )
        print(f"\n📋 Result: {result}")
    else:
        job_id = auto_submit_job(
            wallet=args.wallet,
            truck_style=args.style,
            scene=args.scene,
            camera=args.camera
        )
        print(f"\n✅ Job ID: {job_id}")
