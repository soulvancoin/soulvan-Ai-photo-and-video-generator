// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrailerRemix
 * @dev Community trailer remix competitions with voting
 */
contract TrailerRemix {
    struct Remix {
        string originalTrailer;
        string remixUrl;
        address remixer;
        uint256 votes;
        uint256 timestamp;
        bool winner;
        string remixId;
    }

    mapping(uint256 => Remix) public remixes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(string => uint256[]) public trailerRemixes;  // originalTrailer => remixIds
    
    uint256 public remixCount;
    uint256 public winnerThreshold = 100;

    event RemixSubmitted(
        uint256 indexed remixId,
        string originalTrailer,
        address indexed remixer,
        string remixUrl
    );
    
    event RemixVoted(uint256 indexed remixId, address indexed voter, uint256 totalVotes);
    event RemixWinner(uint256 indexed remixId, string originalTrailer);

    function submitRemix(
        string memory _original,
        string memory _url,
        string memory _remixId
    ) public returns (uint256) {
        uint256 remixId = remixCount;

        remixes[remixId] = Remix({
            originalTrailer: _original,
            remixUrl: _url,
            remixer: msg.sender,
            votes: 0,
            timestamp: block.timestamp,
            winner: false,
            remixId: _remixId
        });

        trailerRemixes[_original].push(remixId);
        remixCount++;

        emit RemixSubmitted(remixId, _original, msg.sender, _url);

        return remixId;
    }

    function voteRemix(uint256 _remixId) public {
        require(_remixId < remixCount, "Remix does not exist");
        require(!hasVoted[_remixId][msg.sender], "Already voted");

        remixes[_remixId].votes++;
        hasVoted[_remixId][msg.sender] = true;

        emit RemixVoted(_remixId, msg.sender, remixes[_remixId].votes);

        // Auto-declare winner at threshold
        if (remixes[_remixId].votes >= winnerThreshold && !remixes[_remixId].winner) {
            remixes[_remixId].winner = true;
            emit RemixWinner(_remixId, remixes[_remixId].originalTrailer);
        }
    }

    function getRemix(uint256 _remixId) public view returns (Remix memory) {
        require(_remixId < remixCount, "Remix does not exist");
        return remixes[_remixId];
    }

    function getTrailerRemixes(string memory _original) public view returns (uint256[] memory) {
        return trailerRemixes[_original];
    }

    function getTopRemixes(uint256 _limit) public view returns (uint256[] memory) {
        // Simple implementation - return recent remixes sorted by votes
        uint256[] memory topRemixes = new uint256[](_limit);
        uint256 count = 0;

        for (uint256 i = remixCount; i > 0 && count < _limit; i--) {
            if (remixes[i - 1].votes > 0) {
                topRemixes[count] = i - 1;
                count++;
            }
        }

        return topRemixes;
    }

    function getWinners() public view returns (uint256[] memory) {
        uint256 winnerCount = 0;
        
        for (uint256 i = 0; i < remixCount; i++) {
            if (remixes[i].winner) {
                winnerCount++;
            }
        }

        uint256[] memory winners = new uint256[](winnerCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < remixCount; i++) {
            if (remixes[i].winner) {
                winners[resultIndex] = i;
                resultIndex++;
            }
        }

        return winners;
    }
}
