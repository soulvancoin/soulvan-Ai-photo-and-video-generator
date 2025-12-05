// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FactionPrestige
 * @dev Track faction prestige and unlock legendary rewards
 */
contract FactionPrestige {
    struct Unlock {
        string name;
        string description;
        uint256 prestigeRequired;
        bool unlocked;
        uint256 unlockedTimestamp;
    }

    mapping(string => uint256) public prestige;
    mapping(string => string[]) public unlocks;
    mapping(string => mapping(string => Unlock)) public factionUnlocks;
    mapping(string => uint256) public memberCount;
    mapping(string => address[]) public members;

    event PrestigeAdded(string indexed faction, uint256 points, uint256 totalPrestige);
    event UnlockAchieved(string indexed faction, string unlockName, uint256 prestigeRequired);

    constructor() {
        // Initialize legendary unlocks
        _initializeUnlocks();
    }

    function _initializeUnlocks() private {
        // Tier 1: 1000 prestige
        _createUnlock("Legendary Vehicle: Solus GT Mythic", 1000, "Ultra-rare vehicle with custom livery");
        _createUnlock("Exclusive Zone Access: ShadowVault", 1000, "Access to hidden vault missions");
        
        // Tier 2: 2000 prestige
        _createUnlock("Zone Override Mission", 2000, "Create custom faction mission in any zone");
        _createUnlock("Legendary Vehicle: Vision GT Shadow", 2000, "Stealth supercar with active camo");
        
        // Tier 3: 5000 prestige
        _createUnlock("Faction HQ Building", 5000, "Physical presence in main zones");
        _createUnlock("Custom Faction Theme Music", 5000, "AI-generated faction anthem");
        
        // Tier 4: 10000 prestige
        _createUnlock("Mythic Founder Status", 10000, "Permanent recognition in game lore");
        _createUnlock("Legendary Vehicle Fleet", 10000, "Unlock all legendary vehicles");
    }

    function _createUnlock(string memory name, uint256 prestigeRequired, string memory description) private {
        // Store unlock template (simplified - would track per faction)
    }

    function addPrestige(string memory _faction, uint256 _points) public {
        prestige[_faction] += _points;
        
        emit PrestigeAdded(_faction, _points, prestige[_faction]);

        // Check for unlock achievements
        _checkUnlocks(_faction);
    }

    function _checkUnlocks(string memory _faction) private {
        uint256 factionPrestige = prestige[_faction];

        // Tier 1: 1000 prestige
        if (factionPrestige >= 1000 && !_hasUnlock(_faction, "Legendary Vehicle: Solus GT Mythic")) {
            _grantUnlock(_faction, "Legendary Vehicle: Solus GT Mythic");
            _grantUnlock(_faction, "Exclusive Zone Access: ShadowVault");
        }

        // Tier 2: 2000 prestige
        if (factionPrestige >= 2000 && !_hasUnlock(_faction, "Zone Override Mission")) {
            _grantUnlock(_faction, "Zone Override Mission");
            _grantUnlock(_faction, "Legendary Vehicle: Vision GT Shadow");
        }

        // Tier 3: 5000 prestige
        if (factionPrestige >= 5000 && !_hasUnlock(_faction, "Faction HQ Building")) {
            _grantUnlock(_faction, "Faction HQ Building");
            _grantUnlock(_faction, "Custom Faction Theme Music");
        }

        // Tier 4: 10000 prestige
        if (factionPrestige >= 10000 && !_hasUnlock(_faction, "Mythic Founder Status")) {
            _grantUnlock(_faction, "Mythic Founder Status");
            _grantUnlock(_faction, "Legendary Vehicle Fleet");
        }
    }

    function _hasUnlock(string memory _faction, string memory _unlockName) private view returns (bool) {
        string[] memory factionUnlockList = unlocks[_faction];
        for (uint256 i = 0; i < factionUnlockList.length; i++) {
            if (keccak256(bytes(factionUnlockList[i])) == keccak256(bytes(_unlockName))) {
                return true;
            }
        }
        return false;
    }

    function _grantUnlock(string memory _faction, string memory _unlockName) private {
        if (!_hasUnlock(_faction, _unlockName)) {
            unlocks[_faction].push(_unlockName);
            emit UnlockAchieved(_faction, _unlockName, prestige[_faction]);
        }
    }

    function getUnlocks(string memory _faction) public view returns (string[] memory) {
        return unlocks[_faction];
    }

    function getPrestige(string memory _faction) public view returns (uint256) {
        return prestige[_faction];
    }

    function joinFaction(string memory _faction) public {
        members[_faction].push(msg.sender);
        memberCount[_faction]++;
    }

    function getMemberCount(string memory _faction) public view returns (uint256) {
        return memberCount[_faction];
    }

    function hasUnlocked(string memory _faction, string memory _unlockName) public view returns (bool) {
        return _hasUnlock(_faction, _unlockName);
    }

    // Prestige earning actions
    function recordMissionCompletion(string memory _faction) public {
        addPrestige(_faction, 10);
    }

    function recordZoneCapture(string memory _faction) public {
        addPrestige(_faction, 100);
    }

    function recordLoreApproval(string memory _faction) public {
        addPrestige(_faction, 50);
    }

    function recordTrailerApproval(string memory _faction) public {
        addPrestige(_faction, 200);
    }
}
