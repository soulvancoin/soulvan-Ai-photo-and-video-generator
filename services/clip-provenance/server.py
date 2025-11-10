from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import hashlib
import json
import os
from flask import Flask, request, jsonify
from database import Database
from storage import StorageUploader

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Initialize database and storage
db = Database()
storage = StorageUploader()

# In-memory cache (for demo; use database in production)
known = []  # [(id, embedding)]

def embed(path):
    image = Image.open(path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        feats = model.get_image_features(**inputs)
    feats = feats / feats.norm(p=2, dim=-1, keepdim=True)
    return feats

def similarity(a, b):
    return torch.cosine_similarity(a, b).item()

app = Flask(__name__)

@app.post("/embed")
def do_embed():
    data = request.json
    path = data["path"]
    emb = embed(path)
    
    # Store in database if artifact_id provided
    if "artifact_id" in data:
        db.store_embedding(
            artifact_id=data["artifact_id"],
            embedding=emb.squeeze().tolist(),
            metadata=data.get("metadata")
        )
    
    return jsonify({"vector": emb.tolist()})

@app.post("/audit")
def audit():
    data = request.json
    path = data["path"]
    emb = embed(path)
    
    # Load embeddings from database
    stored = db.get_all_embeddings()
    
    if not stored:
        score = 1.0
        matches = []
    else:
        sims = []
        for row in stored:
            stored_emb = torch.tensor(row['embedding']).unsqueeze(0)
            sim = similarity(emb, stored_emb)
            sims.append({"id": row['artifact_id'], "similarity": sim})
        
        sims.sort(key=lambda x: x['similarity'], reverse=True)
        top_sim = sims[0]['similarity'] if sims else 0
        originality = 1 - min(1.0, top_sim)
        matches = sims[:5]
        score = originality
    
    # Store job metadata if job_id provided
    if "job_id" in data:
        db.store_job_metadata(
            job_id=data["job_id"],
            wallet=data.get("wallet", "unknown"),
            scene=data.get("scene", "unknown"),
            output=None,
            format=data.get("format", "unknown"),
            score=score,
            signed_hash=None,
            signature=None
        )
    
    return jsonify({"originalityScore": score, "matches": matches})

@app.post("/index")
def index():
    data = request.json
    path = data["path"]
    art_id = data.get("id", os.path.basename(path))
    emb = embed(path)
    
    # Store in database
    db.store_embedding(
        artifact_id=art_id,
        embedding=emb.squeeze().tolist(),
        metadata=data.get("metadata")
    )
    
    # Also add to in-memory cache
    known.append((art_id, emb))
    
    return jsonify({"indexed": art_id})

@app.post("/sign")
def sign():
    data = request.json
    path = data["path"]
    wallet_key = data.get("wallet_key", "demo-key")
    
    with open(path, "rb") as f:
        digest = hashlib.sha256(f.read()).hexdigest()
    
    signature = f"signed({digest})_with_{wallet_key[:6]}"
    
    # Update job metadata if job_id provided
    if "job_id" in data:
        job = db.get_job_status(data["job_id"])
        if job:
            db.store_job_metadata(
                job_id=data["job_id"],
                wallet=job['creator_wallet'],
                scene=job['scene'],
                output=job.get('output_url'),
                format=job['format'],
                score=job.get('originality_score'),
                signed_hash=digest,
                signature=signature
            )
    
    return jsonify({"hash": digest, "signature": signature})

@app.post("/upload")
def upload():
    """Upload artifact to S3 and/or IPFS"""
    data = request.json
    file_path = data["path"]
    storage_type = data.get("storage", "s3")  # "s3", "ipfs", or "dual"
    
    try:
        if storage_type == "s3":
            s3_uri = storage.upload_to_s3(
                file_path,
                data.get("bucket", os.getenv("S3_BUCKET", "soulvan-artifacts")),
                data.get("key", os.path.basename(file_path))
            )
            result = {"s3_uri": s3_uri}
        
        elif storage_type == "ipfs":
            ipfs_result = storage.upload_to_ipfs(file_path, data.get("metadata"))
            result = ipfs_result
        
        elif storage_type == "dual":
            dual_result = storage.upload_dual(
                file_path,
                data.get("bucket", os.getenv("S3_BUCKET", "soulvan-artifacts")),
                data.get("key", os.path.basename(file_path)),
                data.get("metadata")
            )
            result = dual_result
        
        else:
            return jsonify({"error": "Invalid storage type"}), 400
        
        # Update job output URL if job_id provided
        if "job_id" in data:
            job = db.get_job_status(data["job_id"])
            if job:
                output_url = result.get("ipfs_url") or result.get("s3_uri")
                db.store_job_metadata(
                    job_id=data["job_id"],
                    wallet=job['creator_wallet'],
                    scene=job['scene'],
                    output=output_url,
                    format=job['format'],
                    score=job.get('originality_score'),
                    signed_hash=job.get('signed_hash'),
                    signature=job.get('signature')
                )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5200)
