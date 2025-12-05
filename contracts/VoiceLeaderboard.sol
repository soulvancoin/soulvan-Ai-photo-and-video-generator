// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VoiceLeaderboard
 * @dev Track and rank top voiceover contributors by votes and plays
 */
contract VoiceLeaderboard {
    struct Clip {
        address contributor;
        string character;
        string url;
        uint256 votes;
        uint256 plays;
        uint256 timestamp;
        bool featured;
    }

    mapping(uint256 => Clip) public clips;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public contributorScore;  // Total score for contributor
    
    uint256 public clipCount;
    uint256 public constant VOTE_WEIGHT = 10;
    uint256 public constant PLAY_WEIGHT = 1;

    event ClipRegistered(uint256 indexed clipId, address indexed contributor, string character);
    event ClipVoted(uint256 indexed clipId, address indexed voter);
    event ClipPlayed(uint256 indexed clipId);
    event ClipFeatured(uint256 indexed clipId);

    function registerClip(string memory _character, string memory _url) public returns (uint256) {
        uint256 clipId = clipCount;

        clips[clipId] = Clip({
            contributor: msg.sender,
            character: _character,
            url: _url,
            votes: 0,
            plays: 0,
            timestamp: block.timestamp,
            featured: false
        });

        clipCount++;

        emit ClipRegistered(clipId, msg.sender, _character);

        return clipId;
    }

    function voteClip(uint256 _clipId) public {
        require(_clipId < clipCount, "Clip does not exist");
        require(!hasVoted[_clipId][msg.sender], "Already voted");

        clips[_clipId].votes++;
        hasVoted[_clipId][msg.sender] = true;

        // Update contributor score
        contributorScore[clips[_clipId].contributor] += VOTE_WEIGHT;

        emit ClipVoted(_clipId, msg.sender);

        // Auto-feature if 20+ votes
        if (clips[_clipId].votes >= 20 && !clips[_clipId].featured) {
            clips[_clipId].featured = true;
            emit ClipFeatured(_clipId);
        }
    }

    function playClip(uint256 _clipId) public {
        require(_clipId < clipCount, "Clip does not exist");

        clips[_clipId].plays++;

        // Update contributor score
        contributorScore[clips[_clipId].contributor] += PLAY_WEIGHT;

        emit ClipPlayed(_clipId);
    }

    function getClip(uint256 _clipId) public view returns (Clip memory) {
        require(_clipId < clipCount, "Clip does not exist");
        return clips[_clipId];
    }

    function getTopClips(uint256 _limit) public view returns (uint256[] memory) {
        // Simple implementation - return most recent featured clips
        // In production, use more sophisticated ranking algorithm
        uint256[] memory topClips = new uint256[](_limit);
        uint256 count = 0;

        for (uint256 i = clipCount; i > 0 && count < _limit; i--) {
            if (clips[i - 1].featured) {
                topClips[count] = i - 1;
                count++;
            }
        }

        return topClips;
    }

    function getContributorScore(address _contributor) public view returns (uint256) {
        return contributorScore[_contributor];
    }

    function getClipScore(uint256 _clipId) public view returns (uint256) {
        require(_clipId < clipCount, "Clip does not exist");
        return (clips[_clipId].votes * VOTE_WEIGHT) + (clips[_clipId].plays * PLAY_WEIGHT);
    }
}
