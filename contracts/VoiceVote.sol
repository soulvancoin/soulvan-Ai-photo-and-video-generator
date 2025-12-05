// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VoiceVote
 * @dev Decentralized voiceover script voting and approval system
 * Contributors submit character dialogue → Community votes → Approved scripts get recorded
 */
contract VoiceVote {
    struct Script {
        string character;        // Character name (e.g., "Neon Reaper", "Zone Commander")
        string zone;            // Zone/location (e.g., "NeonDistrict", "IndustrialBay")
        string line;            // Voice line text
        address author;         // Script submitter
        uint256 votes;          // Total votes received
        bool approved;          // Approved for recording
        uint256 timestamp;      // Submission timestamp
        string audioUrl;        // IPFS URL after recording (if approved)
        uint256 scriptId;       // Unique identifier
    }

    struct Voter {
        bool hasVoted;
        uint256 timestamp;
    }

    // Script storage
    mapping(uint256 => Script) public scripts;
    mapping(uint256 => mapping(address => Voter)) public scriptVotes;
    
    // Tracking
    uint256 public scriptCount;
    uint256 public approvalThreshold = 10;  // Votes needed for approval
    uint256 public minStakeRequired = 100;  // Minimum $SOUL tokens to vote
    
    // Character & Zone tracking
    mapping(string => uint256[]) public characterScripts;
    mapping(string => uint256[]) public zoneScripts;
    mapping(address => uint256[]) public authorScripts;
    
    // Events
    event ScriptSubmitted(
        uint256 indexed scriptId,
        string character,
        string zone,
        address indexed author,
        string line
    );
    
    event ScriptVoted(
        uint256 indexed scriptId,
        address indexed voter,
        uint256 totalVotes
    );
    
    event ScriptApproved(
        uint256 indexed scriptId,
        string character,
        string zone,
        uint256 finalVotes
    );
    
    event AudioRecorded(
        uint256 indexed scriptId,
        string audioUrl
    );

    // Modifiers
    modifier scriptExists(uint256 _scriptId) {
        require(_scriptId < scriptCount, "Script does not exist");
        _;
    }

    modifier hasNotVoted(uint256 _scriptId) {
        require(!scriptVotes[_scriptId][msg.sender].hasVoted, "Already voted for this script");
        _;
    }

    /**
     * @dev Submit a new voiceover script for voting
     * @param _character Character name
     * @param _zone Zone/location
     * @param _line Voice line text
     */
    function submitScript(
        string memory _character,
        string memory _zone,
        string memory _line
    ) public returns (uint256) {
        require(bytes(_character).length > 0, "Character name required");
        require(bytes(_zone).length > 0, "Zone required");
        require(bytes(_line).length > 0, "Voice line required");
        require(bytes(_line).length <= 500, "Line too long (max 500 chars)");

        uint256 scriptId = scriptCount;

        scripts[scriptId] = Script({
            character: _character,
            zone: _zone,
            line: _line,
            author: msg.sender,
            votes: 0,
            approved: false,
            timestamp: block.timestamp,
            audioUrl: "",
            scriptId: scriptId
        });

        // Track by character, zone, author
        characterScripts[_character].push(scriptId);
        zoneScripts[_zone].push(scriptId);
        authorScripts[msg.sender].push(scriptId);

        scriptCount++;

        emit ScriptSubmitted(scriptId, _character, _zone, msg.sender, _line);

        return scriptId;
    }

    /**
     * @dev Vote for a script
     * @param _scriptId Script to vote for
     */
    function voteScript(uint256 _scriptId) 
        public 
        scriptExists(_scriptId) 
        hasNotVoted(_scriptId) 
    {
        Script storage script = scripts[_scriptId];
        require(!script.approved, "Script already approved");

        // Record vote
        scriptVotes[_scriptId][msg.sender] = Voter({
            hasVoted: true,
            timestamp: block.timestamp
        });

        script.votes++;

        emit ScriptVoted(_scriptId, msg.sender, script.votes);

        // Auto-approve if threshold reached
        if (script.votes >= approvalThreshold && !script.approved) {
            script.approved = true;
            emit ScriptApproved(_scriptId, script.character, script.zone, script.votes);
        }
    }

    /**
     * @dev Submit recorded audio URL for approved script
     * @param _scriptId Script ID
     * @param _audioUrl IPFS URL of recorded audio
     */
    function submitAudio(uint256 _scriptId, string memory _audioUrl) 
        public 
        scriptExists(_scriptId) 
    {
        Script storage script = scripts[_scriptId];
        require(script.author == msg.sender, "Only author can submit audio");
        require(script.approved, "Script not approved yet");
        require(bytes(script.audioUrl).length == 0, "Audio already submitted");

        script.audioUrl = _audioUrl;

        emit AudioRecorded(_scriptId, _audioUrl);
    }

    /**
     * @dev Get script details
     */
    function getScript(uint256 _scriptId) 
        public 
        view 
        scriptExists(_scriptId) 
        returns (
            string memory character,
            string memory zone,
            string memory line,
            address author,
            uint256 votes,
            bool approved,
            uint256 timestamp,
            string memory audioUrl
        ) 
    {
        Script memory script = scripts[_scriptId];
        return (
            script.character,
            script.zone,
            script.line,
            script.author,
            script.votes,
            script.approved,
            script.timestamp,
            script.audioUrl
        );
    }

    /**
     * @dev Get all scripts for a character
     */
    function getCharacterScripts(string memory _character) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return characterScripts[_character];
    }

    /**
     * @dev Get all scripts for a zone
     */
    function getZoneScripts(string memory _zone) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return zoneScripts[_zone];
    }

    /**
     * @dev Get all scripts by an author
     */
    function getAuthorScripts(address _author) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return authorScripts[_author];
    }

    /**
     * @dev Get approved scripts only
     */
    function getApprovedScripts(uint256 _offset, uint256 _limit) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 approvedCount = 0;
        
        // Count approved scripts
        for (uint256 i = 0; i < scriptCount; i++) {
            if (scripts[i].approved) {
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

        for (uint256 i = 0; i < scriptCount && resultIndex < resultSize; i++) {
            if (scripts[i].approved) {
                if (skipped >= _offset) {
                    result[resultIndex] = i;
                    resultIndex++;
                } else {
                    skipped++;
                }
            }
        }

        return result;
    }

    /**
     * @dev Check if user has voted for script
     */
    function hasVotedForScript(uint256 _scriptId, address _voter) 
        public 
        view 
        scriptExists(_scriptId) 
        returns (bool) 
    {
        return scriptVotes[_scriptId][_voter].hasVoted;
    }

    /**
     * @dev Update approval threshold (governance function)
     */
    function setApprovalThreshold(uint256 _threshold) public {
        // In production, add onlyOwner or governance modifier
        require(_threshold > 0, "Threshold must be positive");
        approvalThreshold = _threshold;
    }

    /**
     * @dev Get voting statistics
     */
    function getVotingStats() 
        public 
        view 
        returns (
            uint256 totalScripts,
            uint256 totalApproved,
            uint256 totalWithAudio,
            uint256 threshold
        ) 
    {
        uint256 approvedCount = 0;
        uint256 audioCount = 0;

        for (uint256 i = 0; i < scriptCount; i++) {
            if (scripts[i].approved) {
                approvedCount++;
            }
            if (bytes(scripts[i].audioUrl).length > 0) {
                audioCount++;
            }
        }

        return (scriptCount, approvedCount, audioCount, approvalThreshold);
    }
}
