// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title LegendaryUnlock
 * @dev Manage legendary vehicle unlocks based on faction prestige
 */
contract LegendaryUnlock {
    struct Vehicle {
        string name;
        string description;
        uint256 requiredPrestige;
        string modelUrl;       // IPFS URL for 3D model
        string tuningUrl;      // IPFS URL for tuning profile
        bool exclusive;        // Only one faction can unlock
        string unlockedBy;     // Faction that unlocked (if exclusive)
    }

    mapping(string => Vehicle) public vehicles;
    mapping(string => bool) public unlocked;                    // vehicleName => unlocked
    mapping(string => mapping(string => bool)) public factionUnlocks;  // faction => vehicle => unlocked
    
    string[] public vehicleNames;

    event VehicleUnlocked(string indexed vehicleName, string faction, uint256 prestige);
    event ExclusiveVehicleClaimed(string indexed vehicleName, string faction);

    constructor() {
        _initializeVehicles();
    }

    function _initializeVehicles() private {
        // Tier 1: 1000 prestige
        _addVehicle(
            "SolusGT_Mythic",
            "Solus GT Mythic Edition - Legendary hypercar with holographic livery",
            1000,
            "ipfs://QmSolusGTMythic",
            "ipfs://QmSolusGTTuning",
            false
        );

        _addVehicle(
            "PhantomRider",
            "Phantom Rider - Stealth motorcycle with active camo",
            1000,
            "ipfs://QmPhantomRider",
            "ipfs://QmPhantomTuning",
            false
        );

        // Tier 2: 2000 prestige
        _addVehicle(
            "VisionGT_Shadow",
            "Vision GT Shadow - Ultra-rare stealth supercar",
            2000,
            "ipfs://QmVisionGTShadow",
            "ipfs://QmVisionGTTuning",
            true  // Exclusive!
        );

        _addVehicle(
            "NeonDrifter_Elite",
            "Neon Drifter Elite - Custom drift machine",
            2000,
            "ipfs://QmNeonDrifter",
            "ipfs://QmNeonDrifterTuning",
            false
        );

        // Tier 3: 5000 prestige
        _addVehicle(
            "MythicConvoy",
            "Mythic Convoy - Armored transport with faction branding",
            5000,
            "ipfs://QmMythicConvoy",
            "ipfs://QmConvoyTuning",
            false
        );

        // Tier 4: 10000 prestige
        _addVehicle(
            "OmegaThrone",
            "Omega Throne - Ultimate legendary vehicle",
            10000,
            "ipfs://QmOmegaThrone",
            "ipfs://QmOmegaTuning",
            true  // Exclusive!
        );
    }

    function _addVehicle(
        string memory _name,
        string memory _description,
        uint256 _prestige,
        string memory _modelUrl,
        string memory _tuningUrl,
        bool _exclusive
    ) private {
        vehicles[_name] = Vehicle({
            name: _name,
            description: _description,
            requiredPrestige: _prestige,
            modelUrl: _modelUrl,
            tuningUrl: _tuningUrl,
            exclusive: _exclusive,
            unlockedBy: ""
        });
        vehicleNames.push(_name);
    }

    function unlock(string memory _vehicle, string memory _faction, uint256 _factionPrestige) public {
        Vehicle storage vehicle = vehicles[_vehicle];
        require(bytes(vehicle.name).length > 0, "Vehicle does not exist");
        require(_factionPrestige >= vehicle.requiredPrestige, "Not enough prestige");
        
        if (vehicle.exclusive) {
            require(bytes(vehicle.unlockedBy).length == 0, "Exclusive vehicle already claimed");
            vehicle.unlockedBy = _faction;
            emit ExclusiveVehicleClaimed(_vehicle, _faction);
        }

        unlocked[_vehicle] = true;
        factionUnlocks[_faction][_vehicle] = true;

        emit VehicleUnlocked(_vehicle, _faction, _factionPrestige);
    }

    function isUnlocked(string memory _vehicle) public view returns (bool) {
        return unlocked[_vehicle];
    }

    function isFactionUnlocked(string memory _faction, string memory _vehicle) public view returns (bool) {
        return factionUnlocks[_faction][_vehicle];
    }

    function getVehicle(string memory _vehicle) public view returns (Vehicle memory) {
        return vehicles[_vehicle];
    }

    function getAllVehicles() public view returns (string[] memory) {
        return vehicleNames;
    }

    function getExclusiveOwner(string memory _vehicle) public view returns (string memory) {
        return vehicles[_vehicle].unlockedBy;
    }
}
