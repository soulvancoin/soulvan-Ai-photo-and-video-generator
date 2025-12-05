import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import Optional, List, Dict, Any
import uuid

class Database:
    def __init__(self):
        self.conn_params = {
            'dbname': os.getenv('DB_NAME', 'soulvan'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres'),
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432')
        }
    
    def get_connection(self):
        return psycopg2.connect(**self.conn_params)
    
    def store_job_metadata(
        self,
        job_id: str,
        wallet: str,
        scene: str,
        output: Optional[str],
        format: str,
        score: Optional[float],
        signed_hash: Optional[str],
        signature: Optional[str]
    ):
        """Store render job metadata"""
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO render_jobs 
                    (id, creator_wallet, scene, output_url, format, 
                     originality_score, signed_hash, signature)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        output_url = EXCLUDED.output_url,
                        originality_score = EXCLUDED.originality_score,
                        signed_hash = EXCLUDED.signed_hash,
                        signature = EXCLUDED.signature,
                        updated_at = NOW()
                """, (job_id, wallet, scene, output, format, score, signed_hash, signature))
                conn.commit()
        finally:
            conn.close()
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve job metadata by ID"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM render_jobs WHERE id = %s", (job_id,))
                return cur.fetchone()
        finally:
            conn.close()
    
    def store_embedding(self, artifact_id: str, embedding: List[float], metadata: Optional[Dict] = None):
        """Store CLIP embedding for artifact"""
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO clip_embeddings (artifact_id, embedding, metadata)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (artifact_id) DO UPDATE SET
                        embedding = EXCLUDED.embedding,
                        metadata = EXCLUDED.metadata,
                        indexed_at = NOW()
                """, (artifact_id, embedding, psycopg2.extras.Json(metadata or {})))
                conn.commit()
        finally:
            conn.close()
    
    def get_all_embeddings(self) -> List[Dict[str, Any]]:
        """Retrieve all stored embeddings"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT artifact_id, embedding FROM clip_embeddings")
                return cur.fetchall()
        finally:
            conn.close()
    
    def store_vote(self, job_id: str, wallet: str, vote: str, reason: Optional[str] = None):
        """Store DAO vote"""
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO dao_votes (job_id, voter_wallet, vote, reason)
                    VALUES (%s, %s, %s, %s)
                """, (job_id, wallet, vote, reason))
                conn.commit()
        finally:
            conn.close()
    
    def get_votes(self, job_id: str) -> List[Dict[str, Any]]:
        """Get all votes for a job"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT voter_wallet, vote, reason, created_at 
                    FROM dao_votes 
                    WHERE job_id = %s
                    ORDER BY created_at DESC
                """, (job_id,))
                return cur.fetchall()
        finally:
            conn.close()
    
    def tally_votes(self, job_id: str) -> Dict[str, int]:
        """Count votes for a job"""
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT vote, COUNT(*) as count 
                    FROM dao_votes 
                    WHERE job_id = %s 
                    GROUP BY vote
                """, (job_id,))
                results = cur.fetchall()
                return {vote: count for vote, count in results}
        finally:
            conn.close()
