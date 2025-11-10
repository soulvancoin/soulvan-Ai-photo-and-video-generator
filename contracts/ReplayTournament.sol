// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ReplayTournament
 * @dev Manage competitive replay tournaments with entry tracking and leaderboards
 */
contract ReplayTournament {
    struct Tournament {
        string name;
        uint256 startTime;
        uint256 endTime;
        string missionId;
        bool active;
        uint256 entryCount;
        address winner;
        uint256 winningScore;
    }

    struct Entry {
        uint256 tournamentId;
        address player;
        string replayUrl;
        uint256 score;
        uint256 timestamp;
        bool qualified;
    }

    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => Entry) public entries;
    mapping(uint256 => uint256[]) public tournamentEntries;  // tournamentId => entryIds
    mapping(uint256 => mapping(address => bool)) public hasEntered;
    
    uint256 public tournamentCount;
    uint256 public entryCount;

    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        string missionId,
        uint256 startTime,
        uint256 endTime
    );
    
    event EntrySubmitted(
        uint256 indexed entryId,
        uint256 indexed tournamentId,
        address indexed player,
        uint256 score
    );
    
    event TournamentEnded(uint256 indexed tournamentId, address winner, uint256 score);

    function createTournament(
        string memory _name,
        string memory _missionId,
        uint256 _durationHours
    ) public returns (uint256) {
        uint256 tournamentId = tournamentCount;

        tournaments[tournamentId] = Tournament({
            name: _name,
            startTime: block.timestamp,
            endTime: block.timestamp + (_durationHours * 1 hours),
            missionId: _missionId,
            active: true,
            entryCount: 0,
            winner: address(0),
            winningScore: 0
        });

        tournamentCount++;

        emit TournamentCreated(
            tournamentId,
            _name,
            _missionId,
            block.timestamp,
            tournaments[tournamentId].endTime
        );

        return tournamentId;
    }

    function submitEntry(
        uint256 _tournamentId,
        string memory _replayUrl,
        uint256 _score
    ) public returns (uint256) {
        require(_tournamentId < tournamentCount, "Tournament does not exist");
        require(tournaments[_tournamentId].active, "Tournament not active");
        require(block.timestamp < tournaments[_tournamentId].endTime, "Tournament ended");
        require(!hasEntered[_tournamentId][msg.sender], "Already entered");

        uint256 entryId = entryCount;

        entries[entryId] = Entry({
            tournamentId: _tournamentId,
            player: msg.sender,
            replayUrl: _replayUrl,
            score: _score,
            timestamp: block.timestamp,
            qualified: _score >= 1000  // Minimum 1000 points to qualify
        });

        tournamentEntries[_tournamentId].push(entryId);
        hasEntered[_tournamentId][msg.sender] = true;
        tournaments[_tournamentId].entryCount++;
        entryCount++;

        emit EntrySubmitted(entryId, _tournamentId, msg.sender, _score);

        // Update winner if higher score
        if (_score > tournaments[_tournamentId].winningScore) {
            tournaments[_tournamentId].winner = msg.sender;
            tournaments[_tournamentId].winningScore = _score;
        }

        return entryId;
    }

    function endTournament(uint256 _tournamentId) public {
        require(_tournamentId < tournamentCount, "Tournament does not exist");
        require(tournaments[_tournamentId].active, "Tournament already ended");
        require(
            block.timestamp >= tournaments[_tournamentId].endTime,
            "Tournament not finished"
        );

        tournaments[_tournamentId].active = false;

        emit TournamentEnded(
            _tournamentId,
            tournaments[_tournamentId].winner,
            tournaments[_tournamentId].winningScore
        );
    }

    function getTournament(uint256 _tournamentId) public view returns (Tournament memory) {
        require(_tournamentId < tournamentCount, "Tournament does not exist");
        return tournaments[_tournamentId];
    }

    function getEntry(uint256 _entryId) public view returns (Entry memory) {
        require(_entryId < entryCount, "Entry does not exist");
        return entries[_entryId];
    }

    function getTournamentEntries(uint256 _tournamentId) public view returns (uint256[] memory) {
        require(_tournamentId < tournamentCount, "Tournament does not exist");
        return tournamentEntries[_tournamentId];
    }

    function getTopEntries(uint256 _tournamentId, uint256 _limit) 
        public 
        view 
        returns (uint256[] memory) 
    {
        require(_tournamentId < tournamentCount, "Tournament does not exist");
        
        uint256[] memory topEntries = new uint256[](_limit);
        uint256[] memory allEntries = tournamentEntries[_tournamentId];
        uint256 count = 0;

        // Simple descending sort by score (would optimize in production)
        for (uint256 i = 0; i < allEntries.length && count < _limit; i++) {
            if (entries[allEntries[i]].qualified) {
                topEntries[count] = allEntries[i];
                count++;
            }
        }

        return topEntries;
    }

    function getActiveTournaments() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < tournamentCount; i++) {
            if (tournaments[i].active && block.timestamp < tournaments[i].endTime) {
                activeCount++;
            }
        }

        uint256[] memory result = new uint256[](activeCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < tournamentCount; i++) {
            if (tournaments[i].active && block.timestamp < tournaments[i].endTime) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }

        return result;
    }
}
