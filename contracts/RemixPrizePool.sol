// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RemixPrizePool
 * @dev DAO-funded prize pools for trailer remix competitions
 */
contract RemixPrizePool {
    struct PrizePool {
        uint256 remixId;
        uint256 totalPool;
        uint256 firstPlace;     // 50%
        uint256 secondPlace;    // 30%
        uint256 thirdPlace;     // 20%
        address[] winners;
        bool distributed;
        uint256 contributorCount;
        uint256 timestamp;
    }

    mapping(uint256 => PrizePool) public pools;
    mapping(uint256 => bool) public hasPool;
    mapping(address => uint256) public contributions;
    
    uint256 public poolCount;
    uint256 public totalFunded;

    event PoolCreated(uint256 indexed remixId, uint256 timestamp);
    
    event PoolFunded(
        uint256 indexed remixId,
        address indexed contributor,
        uint256 amount,
        uint256 totalPool
    );
    
    event PrizeDistributed(
        uint256 indexed remixId,
        address indexed winner,
        uint256 place,
        uint256 amount
    );

    // Allow contract to receive ETH
    receive() external payable {
        // Direct deposits go to general pool
        totalFunded += msg.value;
    }

    function createPool(uint256 _remixId) public returns (uint256) {
        require(!hasPool[_remixId], "Pool already exists");

        pools[_remixId] = PrizePool({
            remixId: _remixId,
            totalPool: 0,
            firstPlace: 0,
            secondPlace: 0,
            thirdPlace: 0,
            winners: new address[](0),
            distributed: false,
            contributorCount: 0,
            timestamp: block.timestamp
        });

        hasPool[_remixId] = true;
        poolCount++;

        emit PoolCreated(_remixId, block.timestamp);

        return _remixId;
    }

    function fundPool(uint256 _remixId) public payable {
        require(hasPool[_remixId], "Pool does not exist");
        require(!pools[_remixId].distributed, "Prize already distributed");
        require(msg.value > 0, "Must send ETH");

        pools[_remixId].totalPool += msg.value;
        pools[_remixId].contributorCount++;
        contributions[msg.sender] += msg.value;
        totalFunded += msg.value;

        // Calculate prize distribution (50%, 30%, 20%)
        pools[_remixId].firstPlace = (pools[_remixId].totalPool * 50) / 100;
        pools[_remixId].secondPlace = (pools[_remixId].totalPool * 30) / 100;
        pools[_remixId].thirdPlace = (pools[_remixId].totalPool * 20) / 100;

        emit PoolFunded(_remixId, msg.sender, msg.value, pools[_remixId].totalPool);
    }

    function declareWinners(
        uint256 _remixId,
        address _first,
        address _second,
        address _third
    ) public {
        require(hasPool[_remixId], "Pool does not exist");
        require(!pools[_remixId].distributed, "Prize already distributed");
        require(pools[_remixId].totalPool > 0, "Pool has no funds");
        require(_first != address(0), "Invalid first place");
        require(_second != address(0), "Invalid second place");
        require(_third != address(0), "Invalid third place");

        pools[_remixId].winners = new address[](3);
        pools[_remixId].winners[0] = _first;
        pools[_remixId].winners[1] = _second;
        pools[_remixId].winners[2] = _third;

        // Distribute prizes
        _distributePrize(_remixId, _first, pools[_remixId].firstPlace, 1);
        _distributePrize(_remixId, _second, pools[_remixId].secondPlace, 2);
        _distributePrize(_remixId, _third, pools[_remixId].thirdPlace, 3);

        pools[_remixId].distributed = true;
    }

    function _distributePrize(
        uint256 _remixId,
        address _winner,
        uint256 _amount,
        uint256 _place
    ) private {
        require(address(this).balance >= _amount, "Insufficient balance");

        (bool success, ) = payable(_winner).call{value: _amount}("");
        require(success, "Transfer failed");

        emit PrizeDistributed(_remixId, _winner, _place, _amount);
    }

    function getPool(uint256 _remixId) public view returns (PrizePool memory) {
        require(hasPool[_remixId], "Pool does not exist");
        return pools[_remixId];
    }

    function getPoolWinners(uint256 _remixId) public view returns (address[] memory) {
        require(hasPool[_remixId], "Pool does not exist");
        return pools[_remixId].winners;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getContributorTotal(address _contributor) public view returns (uint256) {
        return contributions[_contributor];
    }

    function getActivePools() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < poolCount; i++) {
            if (!pools[i].distributed && pools[i].totalPool > 0) {
                activeCount++;
            }
        }

        uint256[] memory result = new uint256[](activeCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < poolCount; i++) {
            if (!pools[i].distributed && pools[i].totalPool > 0) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }

        return result;
    }

    function getDistributedPools() public view returns (uint256[] memory) {
        uint256 distributedCount = 0;
        
        for (uint256 i = 0; i < poolCount; i++) {
            if (pools[i].distributed) {
                distributedCount++;
            }
        }

        uint256[] memory result = new uint256[](distributedCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < poolCount; i++) {
            if (pools[i].distributed) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }

        return result;
    }
}
