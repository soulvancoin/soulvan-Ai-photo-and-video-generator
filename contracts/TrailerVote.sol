// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrailerVote
 * @dev DAO-curated cinematic trailer voting and approval system
 */
contract TrailerVote {
    struct Trailer {
        string title;
        string url;            // IPFS URL for video
        address creator;
        uint256 votes;
        bool approved;
        uint256 timestamp;
        string[] scenes;       // Scene identifiers
        string musicTheme;     // Music track used
        uint256 duration;      // Duration in seconds
        bool featured;         // Featured on homepage
    }

    mapping(uint256 => Trailer) public trailers;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256[]) public creatorTrailers;
    
    uint256 public trailerCount;
    uint256 public approvalThreshold = 10;
    uint256 public featureThreshold = 50;

    event TrailerSubmitted(
        uint256 indexed trailerId,
        string title,
        address indexed creator,
        string url
    );
    
    event TrailerVoted(
        uint256 indexed trailerId,
        address indexed voter,
        uint256 totalVotes
    );
    
    event TrailerApproved(
        uint256 indexed trailerId,
        uint256 finalVotes
    );
    
    event TrailerFeatured(
        uint256 indexed trailerId
    );

    function submitTrailer(
        string memory _title,
        string memory _url,
        string[] memory _scenes,
        string memory _musicTheme,
        uint256 _duration
    ) public returns (uint256) {
        uint256 trailerId = trailerCount;

        trailers[trailerId] = Trailer({
            title: _title,
            url: _url,
            creator: msg.sender,
            votes: 0,
            approved: false,
            timestamp: block.timestamp,
            scenes: _scenes,
            musicTheme: _musicTheme,
            duration: _duration,
            featured: false
        });

        creatorTrailers[msg.sender].push(trailerId);
        trailerCount++;

        emit TrailerSubmitted(trailerId, _title, msg.sender, _url);

        return trailerId;
    }

    function voteTrailer(uint256 _trailerId) public {
        require(_trailerId < trailerCount, "Trailer does not exist");
        require(!hasVoted[_trailerId][msg.sender], "Already voted");

        trailers[_trailerId].votes++;
        hasVoted[_trailerId][msg.sender] = true;

        emit TrailerVoted(_trailerId, msg.sender, trailers[_trailerId].votes);

        // Auto-approve at threshold
        if (trailers[_trailerId].votes >= approvalThreshold && !trailers[_trailerId].approved) {
            trailers[_trailerId].approved = true;
            emit TrailerApproved(_trailerId, trailers[_trailerId].votes);
        }

        // Auto-feature at higher threshold
        if (trailers[_trailerId].votes >= featureThreshold && !trailers[_trailerId].featured) {
            trailers[_trailerId].featured = true;
            emit TrailerFeatured(_trailerId);
        }
    }

    function getTrailer(uint256 _trailerId) public view returns (Trailer memory) {
        require(_trailerId < trailerCount, "Trailer does not exist");
        return trailers[_trailerId];
    }

    function getApprovedTrailers(uint256 _offset, uint256 _limit) public view returns (uint256[] memory) {
        uint256 approvedCount = 0;
        
        // Count approved trailers
        for (uint256 i = 0; i < trailerCount; i++) {
            if (trailers[i].approved) {
                approvedCount++;
            }
        }

        // Apply offset and limit
        uint256 resultSize = approvedCount > _offset ? approvedCount - _offset : 0;
        if (resultSize > _limit) {
            resultSize = _limit;
        }

        uint256[] memory result = new uint256[](resultSize);
        uint256 resultIndex = 0;
        uint256 skipped = 0;

        for (uint256 i = trailerCount; i > 0 && resultIndex < resultSize; i--) {
            if (trailers[i - 1].approved) {
                if (skipped >= _offset) {
                    result[resultIndex] = i - 1;
                    resultIndex++;
                } else {
                    skipped++;
                }
            }
        }

        return result;
    }

    function getFeaturedTrailers() public view returns (uint256[] memory) {
        uint256 featuredCount = 0;
        
        for (uint256 i = 0; i < trailerCount; i++) {
            if (trailers[i].featured) {
                featuredCount++;
            }
        }

        uint256[] memory result = new uint256[](featuredCount);
        uint256 resultIndex = 0;

        for (uint256 i = trailerCount; i > 0 && resultIndex < featuredCount; i--) {
            if (trailers[i - 1].featured) {
                result[resultIndex] = i - 1;
                resultIndex++;
            }
        }

        return result;
    }

    function getCreatorTrailers(address _creator) public view returns (uint256[] memory) {
        return creatorTrailers[_creator];
    }

    function hasVotedForTrailer(uint256 _trailerId, address _voter) public view returns (bool) {
        return hasVoted[_trailerId][_voter];
    }

    function getStats() public view returns (
        uint256 total,
        uint256 approved,
        uint256 featured,
        uint256 threshold
    ) {
        uint256 approvedCount = 0;
        uint256 featuredCount = 0;

        for (uint256 i = 0; i < trailerCount; i++) {
            if (trailers[i].approved) approvedCount++;
            if (trailers[i].featured) featuredCount++;
        }

        return (trailerCount, approvedCount, featuredCount, approvalThreshold);
    }
}
