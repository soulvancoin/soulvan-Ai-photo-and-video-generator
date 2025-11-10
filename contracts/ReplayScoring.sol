// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ReplayScoring
 * @dev Calculate and store replay scores with detailed metrics
 * Formula: airtime * 2 + flips * 3 + nearMisses * 5 + styleBonus
 */
contract ReplayScoring {
    struct ScoreMetrics {
        uint256 airtime;       // milliseconds
        uint256 flips;         // complete rotations
        uint256 nearMisses;    // close calls
        uint256 styleBonus;    // subjective bonus (0-100)
        uint256 totalScore;    // calculated total
        uint256 timestamp;
        address scorer;
        string replayUrl;
    }

    mapping(string => ScoreMetrics) public scores;  // missionId => score
    mapping(address => string[]) public playerScores;  // player => missionIds
    mapping(string => bool) public hasScore;
    
    string[] public allScoredMissions;

    event ScoreSubmitted(
        string indexed missionId,
        address indexed player,
        uint256 totalScore,
        uint256 airtime,
        uint256 flips,
        uint256 nearMisses,
        uint256 styleBonus
    );
    
    event HighScore(string indexed missionId, address indexed player, uint256 score);

    function submitScore(
        string memory _missionId,
        uint256 _airtime,
        uint256 _flips,
        uint256 _nearMisses,
        uint256 _styleBonus,
        string memory _replayUrl
    ) public returns (uint256) {
        require(_styleBonus <= 100, "Style bonus must be 0-100");
        require(!hasScore[_missionId], "Mission already scored");

        // Calculate total: airtime * 2 + flips * 3 + nearMisses * 5 + styleBonus
        uint256 totalScore = (_airtime * 2) + (_flips * 3) + (_nearMisses * 5) + _styleBonus;

        scores[_missionId] = ScoreMetrics({
            airtime: _airtime,
            flips: _flips,
            nearMisses: _nearMisses,
            styleBonus: _styleBonus,
            totalScore: totalScore,
            timestamp: block.timestamp,
            scorer: msg.sender,
            replayUrl: _replayUrl
        });

        hasScore[_missionId] = true;
        playerScores[msg.sender].push(_missionId);
        allScoredMissions.push(_missionId);

        emit ScoreSubmitted(
            _missionId,
            msg.sender,
            totalScore,
            _airtime,
            _flips,
            _nearMisses,
            _styleBonus
        );

        // Emit HighScore event if score > 10000
        if (totalScore > 10000) {
            emit HighScore(_missionId, msg.sender, totalScore);
        }

        return totalScore;
    }

    function getScore(string memory _missionId) public view returns (ScoreMetrics memory) {
        require(hasScore[_missionId], "No score for mission");
        return scores[_missionId];
    }

    function getPlayerScores(address _player) public view returns (string[] memory) {
        return playerScores[_player];
    }

    function getAllScoredMissions() public view returns (string[] memory) {
        return allScoredMissions;
    }

    function getScoreBreakdown(string memory _missionId) 
        public 
        view 
        returns (
            uint256 airtimePoints,
            uint256 flipPoints,
            uint256 nearMissPoints,
            uint256 stylePoints,
            uint256 total
        ) 
    {
        require(hasScore[_missionId], "No score for mission");
        
        ScoreMetrics memory metrics = scores[_missionId];
        
        return (
            metrics.airtime * 2,
            metrics.flips * 3,
            metrics.nearMisses * 5,
            metrics.styleBonus,
            metrics.totalScore
        );
    }

    function getTopScores(uint256 _limit) public view returns (string[] memory) {
        // Return top scoring missions (simplified - would use proper sorting in production)
        uint256 totalMissions = allScoredMissions.length;
        uint256 limit = _limit < totalMissions ? _limit : totalMissions;
        
        string[] memory topMissions = new string[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            if (i < allScoredMissions.length) {
                topMissions[i] = allScoredMissions[allScoredMissions.length - 1 - i];
            }
        }
        
        return topMissions;
    }

    function validateScore(
        uint256 _airtime,
        uint256 _flips,
        uint256 _nearMisses
    ) public pure returns (bool) {
        // Basic validation (would add anti-cheat in production)
        return _airtime <= 300000 &&  // Max 5 minutes airtime
               _flips <= 100 &&       // Max 100 flips
               _nearMisses <= 500;    // Max 500 near misses
    }
}
