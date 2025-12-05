# AI Media Generator

Build and deploy photorealistic images and cinematic videos using an end-to-end GPU acceleration stack.

## 🚀 Features

- 🔥 **Text-to-image** generation with Stable Diffusion
- 🎞️ **Image-to-video** animation powered by AnimateDiff
- 🧠 **Depth & pose control** via MiDaS and OpenPose
- 🖼️ **Post-processing** enhancements with FFmpeg and Real-ESRGAN
- 🧰 **Streamlit UI** for interactive prompt iteration and previews
- 🐳 **Docker container** for GPU-ready deployment
- 🌐 Optional **IPFS/NFT hooks** for Soulvancoin integrations

## 🧠 Requirements

- Python 3.10+
- CUDA-enabled GPU (RTX 3090 or better recommended)
- NVIDIA drivers with a matching PyTorch + CUDA build
- Git, Docker (optional for containerized runs)

## 📁 Project Structure

```text
ai-media-generator/
├── README.md
├── requirements.txt
├── src/
│   ├── image_gen.py
│   ├── video_gen.py
│   ├── depth_pose_utils.py
│   ├── postprocess.py
│   └── ui_app.py
├── models/
│   └── checkpoints/
├── assets/
│   └── prompts/
├── docker/
│   └── Dockerfile
└── .gitignore
```

## ⚙️ Quick Start

```bash
git clone https://github.com/yourname/ai-media-generator.git
cd ai-media-generator
pip install -r requirements.txt
python src/ui_app.py
```

Or generate assets directly:

```python
from src.image_gen import generate_image
img = generate_image("a futuristic mining rig glowing in the dark")
img.save("mining_rig.png")

from src.video_gen import generate_video
vid = generate_video("Soulvancoin logo forming from molten metal", duration=6)
vid.save("soulvancoin_intro.mp4")
```

## 🧩 Optional Extensions

- IPFS upload to store generated media on decentralized storage
- NFT minting hooks to tokenize outputs through Soulvancoin smart contracts
- Wallet previews for embedding animations inside wallets or explorers

## 💳 Soulvancoin Payment Flow

Integrate pay-to-generate access by capturing Soulvancoin transactions before running the pipelines.

```solidity
// contracts/SoulvancoinPay.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SoulvancoinPay {
    address public owner;

    event MediaPaid(address indexed payer, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function payForMedia() public payable {
        require(msg.value > 0, "No payment received");
        emit MediaPaid(msg.sender, msg.value);
        payable(owner).transfer(msg.value);
    }
}
```

### Frontend invocation (ethers.js)

```ts
import { ethers } from "ethers";

const contractAddress = "<DEPLOYED_CONTRACT_ADDRESS>";
const abi = [
  "function payForMedia() external payable"
];

export async function paySoulvancoin(amountInSVC: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.payForMedia({
    value: ethers.utils.parseEther(amountInSVC)
  });
  await tx.wait();
}
```

### Streamlit payment prompt

```python
st.markdown("## Pay with Soulvancoin")
st.write("Send payment to:")
st.code("Soulvancoin Address: BTC1QJHYZYSGM54JDP00Z296Y48PLMDL79DSNWC2LJ0")
st.code("Soulvancoin Alt Address: EQATeIt1rlgdbc5OaHnz7hsxi9v2SGjT7ZmQMekaq17x5F7n")

if st.button("I've paid — Generate Media"):
    image = generate_image(prompt)
    st.image(image)
```

Hook a backend listener to monitor the `MediaPaid` event and trigger generation once payment is confirmed.

## 🧠 NFT Minting Hook

Wrap generated assets into NFTs after successful payment.

```solidity
// contracts/SoulvancoinMediaNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulvancoinMediaNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("SoulvancoinMedia", "SVCM") {
        tokenCounter = 0;
    }

    function mintMediaNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter += 1;
        return newTokenId;
    }
}
```

Example IPFS metadata payload:

```json
{
  "name": "Soulvancoin Cinematic",
  "description": "AI-generated media asset for Soulvancoin branding",
  "image": "ipfs://Qm.../mining_rig.png",
  "attributes": [
    { "trait_type": "Type", "value": "Video" },
    { "trait_type": "Resolution", "value": "1080p" },
    { "trait_type": "Theme", "value": "Mining Rig" }
  ]
}
```

```ts
const nftContract = new ethers.Contract(nftAddress, nftAbi, signer);
await nftContract.mintMediaNFT(userAddress, ipfsTokenURI);
```

Coordinate the payment, generation, and minting workflow so users receive collectible media immediately after confirmation.

## 📜 License

MIT — open source and community-friendly. Contributions welcome!
