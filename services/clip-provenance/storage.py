import boto3
import requests
import os
from typing import Optional

class StorageUploader:
    """Handles uploads to S3 and IPFS"""
    
    def __init__(self):
        self.s3_client = None
        self.pinata_api_key = os.getenv('PINATA_API_KEY')
        self.pinata_secret = os.getenv('PINATA_SECRET_KEY')
    
    def _get_s3_client(self):
        if not self.s3_client:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION', 'us-east-1')
            )
        return self.s3_client
    
    def upload_to_s3(self, file_path: str, bucket: str, key: str) -> str:
        """
        Upload file to S3 bucket
        
        Args:
            file_path: Local path to file
            bucket: S3 bucket name
            key: Object key in bucket
            
        Returns:
            S3 URI (s3://bucket/key)
        """
        s3 = self._get_s3_client()
        s3.upload_file(file_path, bucket, key)
        return f"s3://{bucket}/{key}"
    
    def upload_to_ipfs(self, file_path: str, metadata: Optional[dict] = None) -> dict:
        """
        Upload file to IPFS via Pinata
        
        Args:
            file_path: Local path to file
            metadata: Optional pinata metadata
            
        Returns:
            Response dict with IpfsHash and other details
        """
        if not self.pinata_api_key or not self.pinata_secret:
            raise ValueError("Pinata credentials not configured")
        
        url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        headers = {
            "pinata_api_key": self.pinata_api_key,
            "pinata_secret_api_key": self.pinata_secret
        }
        
        with open(file_path, 'rb') as f:
            files = {'file': f}
            
            # Add metadata if provided
            if metadata:
                data = {
                    'pinataMetadata': str(metadata),
                    'pinataOptions': '{"cidVersion": 1}'
                }
                response = requests.post(url, files=files, headers=headers, data=data)
            else:
                response = requests.post(url, files=files, headers=headers)
        
        response.raise_for_status()
        result = response.json()
        
        return {
            'ipfs_hash': result['IpfsHash'],
            'size': result['PinSize'],
            'timestamp': result['Timestamp'],
            'gateway_url': f"https://gateway.pinata.cloud/ipfs/{result['IpfsHash']}"
        }
    
    def upload_dual(self, file_path: str, s3_bucket: str, s3_key: str, ipfs_metadata: Optional[dict] = None) -> dict:
        """
        Upload to both S3 and IPFS for redundancy
        
        Returns:
            Dict with both s3_uri and ipfs_hash
        """
        s3_uri = self.upload_to_s3(file_path, s3_bucket, s3_key)
        ipfs_result = self.upload_to_ipfs(file_path, ipfs_metadata)
        
        return {
            's3_uri': s3_uri,
            'ipfs_hash': ipfs_result['ipfs_hash'],
            'ipfs_url': ipfs_result['gateway_url']
        }
