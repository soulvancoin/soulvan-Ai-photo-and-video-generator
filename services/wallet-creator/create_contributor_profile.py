#!/usr/bin/env python3
"""
Soulvan Wallet & Profile Creator
Creates Ethereum wallet and truck style profile for contributors
"""

import json
import os
from pathlib import Path
from eth_account import Account

def create_wallet():
    """Generate a new Ethereum wallet using eth_account"""
    acct = Account.create()
    return {
        "address": acct.address,
        "private_key": acct.key.hex()
    }

def select_truck_style():
    """Interactive truck style selector with music genre hints"""
    styles = [
        ("chrome", "→ synthwave, electronica"),
        ("matte", "→ deep house, minimal techno"),
        ("graffiti", "→ hip-hop, trap"),
        ("mythic", "→ orchestral, epic"),
        ("cyberpunk", "→ industrial, glitch-hop")
    ]
    
    print("\n🚚 Choose your Soulvan truck style:")
    for i, (style, genre) in enumerate(styles):
        print(f"{i+1}. {style.ljust(12)} {genre}")
    
    while True:
        try:
            choice = int(input("\nEnter number (1-5): ")) - 1
            if 0 <= choice < len(styles):
                return styles[choice][0]
            else:
                print("Invalid choice. Please enter 1-5.")
        except ValueError:
            print("Please enter a valid number.")

def save_profile(wallet, style):
    """Save contributor profile to JSON file"""
    # Create contributors directory if it doesn't exist
    contributors_dir = Path("contributors")
    contributors_dir.mkdir(exist_ok=True)
    
    profile = {
        "wallet": wallet["address"],
        "truck_style": style,
        "private_key": wallet["private_key"],
        "created_at": "2025-11-09T00:00:00Z"  # Would use datetime.utcnow().isoformat() in production
    }
    
    profile_path = contributors_dir / f"{wallet['address']}.json"
    with open(profile_path, "w") as f:
        json.dump(profile, f, indent=2)
    
    return profile_path

def main():
    """Main workflow: create wallet → select style → save profile"""
    print("=" * 60)
    print("🎨 SOULVAN CONTRIBUTOR ONBOARDING")
    print("=" * 60)
    
    # Step 1: Create wallet
    print("\n📝 Generating Ethereum wallet...")
    wallet = create_wallet()
    print(f"✅ Wallet created: {wallet['address']}")
    
    # Step 2: Select truck style
    style = select_truck_style()
    print(f"\n✅ Selected style: {style}")
    
    # Step 3: Save profile
    profile_path = save_profile(wallet, style)
    print(f"\n💾 Profile saved to: {profile_path}")
    
    # Security warning
    print("\n" + "=" * 60)
    print("⚠️  SECURITY WARNING")
    print("=" * 60)
    print("Your private key is stored in the profile JSON.")
    print("DO NOT share this file or commit it to version control!")
    print(f"Private key: {wallet['private_key'][:10]}...{wallet['private_key'][-6:]}")
    print("\nBackup this file securely and delete it from disk after importing")
    print("the wallet into your preferred Ethereum wallet app.")
    print("=" * 60)

if __name__ == "__main__":
    main()
