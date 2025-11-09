// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VoiceRegistry
 * @dev Registry for contributor voiceover clips with IPFS storage
 */
contract VoiceRegistry {
    struct Clip {
        string character;
        string zone;
        string url;             // IPFS URL
        address contributor;
        uint256 timestamp;
        uint256 duration;       // Clip duration in seconds
        bool approved;
    }

    mapping(uint256 => Clip) public clips;
    mapping(string => uint256[]) public characterClips;    // character => clipIds
    mapping(string => uint256[]) public zoneClips;         // zone => clipIds
    mapping(address => uint256[]) public contributorClips; // contributor => clipIds
    
    uint256 public clipCount;

    event ClipRegistered(
        uint256 indexed clipId,
        string character,
        string zone,
        address indexed contributor,
        string url
    );

    event ClipApproved(uint256 indexed clipId);

    function registerClip(
        string memory _character,
        string memory _zone,
        string memory _url,
        uint256 _duration
    ) public returns (uint256) {
        uint256 clipId = clipCount;

        clips[clipId] = Clip({
            character: _character,
            zone: _zone,
            url: _url,
            contributor: msg.sender,
            timestamp: block.timestamp,
            duration: _duration,
            approved: false
        });

        characterClips[_character].push(clipId);
        zoneClips[_zone].push(clipId);
        contributorClips[msg.sender].push(clipId);

        clipCount++;

        emit ClipRegistered(clipId, _character, _zone, msg.sender, _url);

        return clipId;
    }

    function approveClip(uint256 _clipId) public {
        require(_clipId < clipCount, "Clip does not exist");
        clips[_clipId].approved = true;
        emit ClipApproved(_clipId);
    }

    function getClip(uint256 _clipId) public view returns (Clip memory) {
        require(_clipId < clipCount, "Clip does not exist");
        return clips[_clipId];
    }

    function getCharacterClips(string memory _character) public view returns (uint256[] memory) {
        return characterClips[_character];
    }

    function getZoneClips(string memory _zone) public view returns (uint256[] memory) {
        return zoneClips[_zone];
    }

    function getContributorClips(address _contributor) public view returns (uint256[] memory) {
        return contributorClips[_contributor];
    }
}
