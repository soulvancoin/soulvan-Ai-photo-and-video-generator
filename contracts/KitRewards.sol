// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title KitRewards
 * @dev Distribute rewards to tuning kit creators based on votes
 * Reward: 0.1 ETH per 10 votes
 */
contract KitRewards {
    struct Reward {
        uint256 kitId;
        uint256 votes;
        uint256 rewardAmount;
        bool claimed;
        address creator;
        uint256 timestamp;
    }

    mapping(uint256 => Reward) public rewards;
    mapping(uint256 => bool) public hasReward;
    mapping(address => uint256[]) public creatorRewards;
    
    uint256 public rewardCount;
    uint256 public constant REWARD_PER_10_VOTES = 0.1 ether;
    uint256 public totalPaidOut;

    event RewardRegistered(
        uint256 indexed kitId,
        address indexed creator,
        uint256 votes,
        uint256 rewardAmount
    );
    
    event RewardClaimed(
        uint256 indexed kitId,
        address indexed creator,
        uint256 amount
    );
    
    event FundsDeposited(address indexed depositor, uint256 amount);

    // Allow contract to receive ETH
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }

    function registerReward(
        uint256 _kitId,
        address _creator,
        uint256 _votes
    ) public {
        require(!hasReward[_kitId], "Reward already registered");
        require(_votes >= 10, "Minimum 10 votes required");

        // Calculate reward: 0.1 ETH per 10 votes
        uint256 rewardAmount = (_votes / 10) * REWARD_PER_10_VOTES;

        rewards[_kitId] = Reward({
            kitId: _kitId,
            votes: _votes,
            rewardAmount: rewardAmount,
            claimed: false,
            creator: _creator,
            timestamp: block.timestamp
        });

        hasReward[_kitId] = true;
        creatorRewards[_creator].push(_kitId);
        rewardCount++;

        emit RewardRegistered(_kitId, _creator, _votes, rewardAmount);
    }

    function claimReward(uint256 _kitId) public {
        require(hasReward[_kitId], "No reward for kit");
        require(rewards[_kitId].creator == msg.sender, "Not reward owner");
        require(!rewards[_kitId].claimed, "Already claimed");
        require(
            address(this).balance >= rewards[_kitId].rewardAmount,
            "Insufficient contract balance"
        );

        rewards[_kitId].claimed = true;
        totalPaidOut += rewards[_kitId].rewardAmount;

        // Transfer reward to creator
        (bool success, ) = payable(msg.sender).call{value: rewards[_kitId].rewardAmount}("");
        require(success, "Transfer failed");

        emit RewardClaimed(_kitId, msg.sender, rewards[_kitId].rewardAmount);
    }

    function getReward(uint256 _kitId) public view returns (Reward memory) {
        require(hasReward[_kitId], "No reward for kit");
        return rewards[_kitId];
    }

    function getCreatorRewards(address _creator) public view returns (uint256[] memory) {
        return creatorRewards[_creator];
    }

    function calculateReward(uint256 _votes) public pure returns (uint256) {
        require(_votes >= 10, "Minimum 10 votes required");
        return (_votes / 10) * REWARD_PER_10_VOTES;
    }

    function getPendingRewards(address _creator) public view returns (uint256) {
        uint256[] memory kitIds = creatorRewards[_creator];
        uint256 pending = 0;

        for (uint256 i = 0; i < kitIds.length; i++) {
            if (!rewards[kitIds[i]].claimed) {
                pending += rewards[kitIds[i]].rewardAmount;
            }
        }

        return pending;
    }

    function getClaimedRewards(address _creator) public view returns (uint256) {
        uint256[] memory kitIds = creatorRewards[_creator];
        uint256 claimed = 0;

        for (uint256 i = 0; i < kitIds.length; i++) {
            if (rewards[kitIds[i]].claimed) {
                claimed += rewards[kitIds[i]].rewardAmount;
            }
        }

        return claimed;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getUnclaimedRewards() public view returns (uint256[] memory) {
        uint256 unclaimedCount = 0;
        
        for (uint256 i = 0; i < rewardCount; i++) {
            if (!rewards[i].claimed) {
                unclaimedCount++;
            }
        }

        uint256[] memory result = new uint256[](unclaimedCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < rewardCount; i++) {
            if (!rewards[i].claimed) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }

        return result;
    }
}
