// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TuningLeaderboard
 * @dev Track and rank faction tuning kits by community votes
 */
contract TuningLeaderboard {
    struct Kit {
        string faction;
        string vehicle;
        address contributor;
        uint256 votes;
        string kitUrl;         // IPFS URL for tuning data
        uint256 timestamp;
        bool featured;
    }

    mapping(uint256 => Kit) public kits;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(string => uint256[]) public factionKits;  // faction => kitIds
    mapping(string => uint256[]) public vehicleKits;  // vehicle => kitIds
    
    uint256 public kitCount;

    event KitSubmitted(
        uint256 indexed kitId,
        string faction,
        string vehicle,
        address indexed contributor
    );
    
    event KitVoted(uint256 indexed kitId, address indexed voter, uint256 totalVotes);
    event KitFeatured(uint256 indexed kitId);

    function submitKit(
        string memory _faction,
        string memory _vehicle,
        string memory _kitUrl
    ) public returns (uint256) {
        uint256 kitId = kitCount;

        kits[kitId] = Kit({
            faction: _faction,
            vehicle: _vehicle,
            contributor: msg.sender,
            votes: 0,
            kitUrl: _kitUrl,
            timestamp: block.timestamp,
            featured: false
        });

        factionKits[_faction].push(kitId);
        vehicleKits[_vehicle].push(kitId);
        kitCount++;

        emit KitSubmitted(kitId, _faction, _vehicle, msg.sender);

        return kitId;
    }

    function voteKit(uint256 _kitId) public {
        require(_kitId < kitCount, "Kit does not exist");
        require(!hasVoted[_kitId][msg.sender], "Already voted");

        kits[_kitId].votes++;
        hasVoted[_kitId][msg.sender] = true;

        emit KitVoted(_kitId, msg.sender, kits[_kitId].votes);

        // Auto-feature at 25 votes
        if (kits[_kitId].votes >= 25 && !kits[_kitId].featured) {
            kits[_kitId].featured = true;
            emit KitFeatured(_kitId);
        }
    }

    function getKit(uint256 _kitId) public view returns (Kit memory) {
        require(_kitId < kitCount, "Kit does not exist");
        return kits[_kitId];
    }

    function getFactionKits(string memory _faction) public view returns (uint256[] memory) {
        return factionKits[_faction];
    }

    function getVehicleKits(string memory _vehicle) public view returns (uint256[] memory) {
        return vehicleKits[_vehicle];
    }

    function getTopKits(uint256 _limit) public view returns (uint256[] memory) {
        // Return top kits by votes (simplified - would use sorting in production)
        uint256[] memory topKits = new uint256[](_limit);
        uint256 count = 0;

        for (uint256 i = kitCount; i > 0 && count < _limit; i--) {
            if (kits[i - 1].votes > 0) {
                topKits[count] = i - 1;
                count++;
            }
        }

        return topKits;
    }

    function getFeaturedKits() public view returns (uint256[] memory) {
        uint256 featuredCount = 0;
        
        for (uint256 i = 0; i < kitCount; i++) {
            if (kits[i].featured) {
                featuredCount++;
            }
        }

        uint256[] memory result = new uint256[](featuredCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < kitCount; i++) {
            if (kits[i].featured) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }

        return result;
    }
}
