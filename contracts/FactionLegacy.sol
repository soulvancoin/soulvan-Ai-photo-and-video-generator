// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FactionLegacy
 * @dev Track faction achievements, territory control, and community contributions
 * Factions compete for mythic prestige across SoulvanUniverse
 */
contract FactionLegacy {
    struct Legacy {
        string faction;                 // Faction name
        uint256 zonesControlled;        // Number of zones controlled
        uint256 missionsCompleted;      // Total missions completed
        uint256 loreApproved;           // Lore submissions approved
        uint256 prestigePoints;         // Overall prestige score
        uint256 memberCount;            // Active members
        address leader;                 // Faction leader
        uint256 foundedTimestamp;       // Creation timestamp
        bool active;                    // Faction status
    }

    struct Achievement {
        string name;                    // Achievement name
        string description;             // Achievement description
        uint256 prestigeReward;         // Prestige points awarded
        uint256 unlockedTimestamp;      // When unlocked
    }

    struct ZoneControl {
        string faction;                 // Controlling faction
        uint256 controlStarted;         // When control began
        uint256 missionActivity;        // Mission activity level
        bool contested;                 // Under attack by rivals
    }

    // Faction storage
    mapping(string => Legacy) public legacies;
    mapping(string => bool) public factionExists;
    mapping(string => Achievement[]) public factionAchievements;
    mapping(string => mapping(address => bool)) public factionMembers;
    
    // Zone control
    mapping(string => ZoneControl) public zoneControl;
    mapping(string => string[]) public factionZones;
    
    // Rankings
    string[] public activeFactions;
    
    // Events
    event FactionCreated(
        string indexed faction,
        address indexed leader,
        uint256 timestamp
    );
    
    event LegacyUpdated(
        string indexed faction,
        uint256 zones,
        uint256 missions,
        uint256 lore,
        uint256 prestige
    );
    
    event ZoneCaptured(
        string indexed zone,
        string indexed faction,
        string previousFaction,
        uint256 timestamp
    );
    
    event AchievementUnlocked(
        string indexed faction,
        string achievementName,
        uint256 prestigeReward
    );
    
    event MemberJoined(
        string indexed faction,
        address indexed member
    );

    /**
     * @dev Create a new faction
     */
    function createFaction(string memory _faction) public {
        require(bytes(_faction).length > 0, "Faction name required");
        require(!factionExists[_faction], "Faction already exists");

        legacies[_faction] = Legacy({
            faction: _faction,
            zonesControlled: 0,
            missionsCompleted: 0,
            loreApproved: 0,
            prestigePoints: 0,
            memberCount: 1,
            leader: msg.sender,
            foundedTimestamp: block.timestamp,
            active: true
        });

        factionExists[_faction] = true;
        factionMembers[_faction][msg.sender] = true;
        activeFactions.push(_faction);

        emit FactionCreated(_faction, msg.sender, block.timestamp);
    }

    /**
     * @dev Update faction legacy data
     */
    function updateLegacy(
        string memory _faction,
        uint256 _zones,
        uint256 _missions,
        uint256 _lore
    ) public {
        require(factionExists[_faction], "Faction does not exist");
        
        Legacy storage legacy = legacies[_faction];
        legacy.zonesControlled = _zones;
        legacy.missionsCompleted = _missions;
        legacy.loreApproved = _lore;
        
        // Calculate prestige: (zones * 100) + (missions * 10) + (lore * 50)
        legacy.prestigePoints = (_zones * 100) + (_missions * 10) + (_lore * 50);

        emit LegacyUpdated(_faction, _zones, _missions, _lore, legacy.prestigePoints);
    }

    /**
     * @dev Increment mission count for a faction
     */
    function recordMissionCompletion(string memory _faction) public {
        require(factionExists[_faction], "Faction does not exist");
        
        Legacy storage legacy = legacies[_faction];
        legacy.missionsCompleted++;
        legacy.prestigePoints += 10;

        emit LegacyUpdated(
            _faction,
            legacy.zonesControlled,
            legacy.missionsCompleted,
            legacy.loreApproved,
            legacy.prestigePoints
        );
    }

    /**
     * @dev Record lore approval for a faction
     */
    function recordLoreApproval(string memory _faction) public {
        require(factionExists[_faction], "Faction does not exist");
        
        Legacy storage legacy = legacies[_faction];
        legacy.loreApproved++;
        legacy.prestigePoints += 50;

        emit LegacyUpdated(
            _faction,
            legacy.zonesControlled,
            legacy.missionsCompleted,
            legacy.loreApproved,
            legacy.prestigePoints
        );
    }

    /**
     * @dev Capture a zone for a faction
     */
    function captureZone(string memory _zone, string memory _faction) public {
        require(factionExists[_faction], "Faction does not exist");
        require(bytes(_zone).length > 0, "Zone name required");

        string memory previousFaction = zoneControl[_zone].faction;
        
        // Update zone control
        zoneControl[_zone] = ZoneControl({
            faction: _faction,
            controlStarted: block.timestamp,
            missionActivity: 0,
            contested: false
        });

        // Update faction zone list
        factionZones[_faction].push(_zone);

        // Update legacy
        Legacy storage legacy = legacies[_faction];
        legacy.zonesControlled++;
        legacy.prestigePoints += 100;

        // Remove from previous faction if applicable
        if (bytes(previousFaction).length > 0 && factionExists[previousFaction]) {
            Legacy storage oldLegacy = legacies[previousFaction];
            if (oldLegacy.zonesControlled > 0) {
                oldLegacy.zonesControlled--;
                oldLegacy.prestigePoints -= 100;
            }
        }

        emit ZoneCaptured(_zone, _faction, previousFaction, block.timestamp);
    }

    /**
     * @dev Unlock an achievement for a faction
     */
    function unlockAchievement(
        string memory _faction,
        string memory _name,
        string memory _description,
        uint256 _prestigeReward
    ) public {
        require(factionExists[_faction], "Faction does not exist");

        Achievement memory achievement = Achievement({
            name: _name,
            description: _description,
            prestigeReward: _prestigeReward,
            unlockedTimestamp: block.timestamp
        });

        factionAchievements[_faction].push(achievement);
        
        Legacy storage legacy = legacies[_faction];
        legacy.prestigePoints += _prestigeReward;

        emit AchievementUnlocked(_faction, _name, _prestigeReward);
    }

    /**
     * @dev Join a faction
     */
    function joinFaction(string memory _faction) public {
        require(factionExists[_faction], "Faction does not exist");
        require(!factionMembers[_faction][msg.sender], "Already a member");

        factionMembers[_faction][msg.sender] = true;
        
        Legacy storage legacy = legacies[_faction];
        legacy.memberCount++;

        emit MemberJoined(_faction, msg.sender);
    }

    /**
     * @dev Get faction legacy
     */
    function getLegacy(string memory _faction) 
        public 
        view 
        returns (Legacy memory) 
    {
        require(factionExists[_faction], "Faction does not exist");
        return legacies[_faction];
    }

    /**
     * @dev Get zones controlled by faction
     */
    function getFactionZones(string memory _faction) 
        public 
        view 
        returns (string[] memory) 
    {
        return factionZones[_faction];
    }

    /**
     * @dev Get faction achievements
     */
    function getFactionAchievements(string memory _faction) 
        public 
        view 
        returns (Achievement[] memory) 
    {
        return factionAchievements[_faction];
    }

    /**
     * @dev Get zone control info
     */
    function getZoneControl(string memory _zone) 
        public 
        view 
        returns (
            string memory faction,
            uint256 controlStarted,
            uint256 missionActivity,
            bool contested
        ) 
    {
        ZoneControl memory control = zoneControl[_zone];
        return (
            control.faction,
            control.controlStarted,
            control.missionActivity,
            control.contested
        );
    }

    /**
     * @dev Get top factions by prestige
     */
    function getTopFactions(uint256 _limit) 
        public 
        view 
        returns (string[] memory, uint256[] memory) 
    {
        uint256 count = activeFactions.length;
        if (count > _limit) {
            count = _limit;
        }

        string[] memory factions = new string[](count);
        uint256[] memory prestige = new uint256[](count);

        // Simple sorting by prestige (bubble sort for small lists)
        string[] memory sortedFactions = activeFactions;
        
        for (uint256 i = 0; i < sortedFactions.length; i++) {
            for (uint256 j = i + 1; j < sortedFactions.length; j++) {
                if (legacies[sortedFactions[i]].prestigePoints < legacies[sortedFactions[j]].prestigePoints) {
                    string memory temp = sortedFactions[i];
                    sortedFactions[i] = sortedFactions[j];
                    sortedFactions[j] = temp;
                }
            }
        }

        // Return top N
        for (uint256 i = 0; i < count; i++) {
            factions[i] = sortedFactions[i];
            prestige[i] = legacies[sortedFactions[i]].prestigePoints;
        }

        return (factions, prestige);
    }

    /**
     * @dev Get total active factions
     */
    function getActiveFactionCount() public view returns (uint256) {
        return activeFactions.length;
    }

    /**
     * @dev Check if user is faction member
     */
    function isMember(string memory _faction, address _user) 
        public 
        view 
        returns (bool) 
    {
        return factionMembers[_faction][_user];
    }

    /**
     * @dev Get faction stats summary
     */
    function getFactionStats(string memory _faction) 
        public 
        view 
        returns (
            uint256 zones,
            uint256 missions,
            uint256 lore,
            uint256 prestige,
            uint256 members,
            uint256 achievements
        ) 
    {
        require(factionExists[_faction], "Faction does not exist");
        
        Legacy memory legacy = legacies[_faction];
        uint256 achievementCount = factionAchievements[_faction].length;

        return (
            legacy.zonesControlled,
            legacy.missionsCompleted,
            legacy.loreApproved,
            legacy.prestigePoints,
            legacy.memberCount,
            achievementCount
        );
    }
}
