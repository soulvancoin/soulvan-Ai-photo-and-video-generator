// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MissionReplay
 * @dev Store and track mission replay videos with view counts
 */
contract MissionReplay {
    struct Replay {
        string missionId;
        address contributor;
        string replayUrl;      // IPFS URL
        uint256 views;
        uint256 timestamp;
        uint256 score;
        bool featured;
    }

    mapping(string => Replay) public replays;
    mapping(address => string[]) public contributorReplays;
    
    string[] public missionIds;

    event ReplayRegistered(
        string indexed missionId,
        address indexed contributor,
        string replayUrl,
        uint256 score
    );
    
    event ReplayViewed(string indexed missionId, uint256 totalViews);
    event ReplayFeatured(string indexed missionId);

    function registerReplay(
        string memory _missionId,
        string memory _url,
        uint256 _score
    ) public {
        require(bytes(replays[_missionId].replayUrl).length == 0, "Replay already exists");

        replays[_missionId] = Replay({
            missionId: _missionId,
            contributor: msg.sender,
            replayUrl: _url,
            views: 0,
            timestamp: block.timestamp,
            score: _score,
            featured: false
        });

        contributorReplays[msg.sender].push(_missionId);
        missionIds.push(_missionId);

        emit ReplayRegistered(_missionId, msg.sender, _url, _score);
    }

    function viewReplay(string memory _missionId) public {
        require(bytes(replays[_missionId].replayUrl).length > 0, "Replay does not exist");
        
        replays[_missionId].views++;
        
        emit ReplayViewed(_missionId, replays[_missionId].views);

        // Auto-feature at 100 views
        if (replays[_missionId].views >= 100 && !replays[_missionId].featured) {
            replays[_missionId].featured = true;
            emit ReplayFeatured(_missionId);
        }
    }

    function getReplay(string memory _missionId) public view returns (Replay memory) {
        return replays[_missionId];
    }

    function getContributorReplays(address _contributor) public view returns (string[] memory) {
        return contributorReplays[_contributor];
    }

    function getFeaturedReplays() public view returns (string[] memory) {
        uint256 featuredCount = 0;
        
        for (uint256 i = 0; i < missionIds.length; i++) {
            if (replays[missionIds[i]].featured) {
                featuredCount++;
            }
        }

        string[] memory result = new string[](featuredCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < missionIds.length; i++) {
            if (replays[missionIds[i]].featured) {
                result[resultIndex] = missionIds[i];
                resultIndex++;
            }
        }

        return result;
    }
}
