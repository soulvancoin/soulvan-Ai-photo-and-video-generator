// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SoulvanUpgradeVoting
 * @notice DAO voting contract for approving/rejecting Soulvan render job upgrades
 * @dev Requires voters to hold SoulvanCoin (ERC20) to participate
 */
contract SoulvanUpgradeVoting {
    
    // Vote structure
    struct Vote {
        address voter;
        bool approve;
        string reason;
        uint256 timestamp;
    }
    
    // Job upgrade proposal tracking
    struct Proposal {
        bytes32 jobId;
        address proposer;
        uint256 approveCount;
        uint256 rejectCount;
        bool executed;
        uint256 createdAt;
    }
    
    // SoulvanCoin token contract
    IERC20 public soulvanCoin;
    
    // Mapping from jobId to array of votes
    mapping(bytes32 => Vote[]) public votes;
    
    // Mapping from jobId to Proposal
    mapping(bytes32 => Proposal) public proposals;
    
    // Mapping to track if an address has voted on a job
    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    
    // Events
    event VoteCast(bytes32 indexed jobId, address indexed voter, bool approve, string reason);
    event ProposalCreated(bytes32 indexed jobId, address indexed proposer);
    event UpgradeApplied(bytes32 indexed jobId, uint256 approveCount, uint256 rejectCount);
    event UpgradeRejected(bytes32 indexed jobId, uint256 approveCount, uint256 rejectCount);
    
    // Errors
    error InsufficientSoulvanCoin(address voter);
    error AlreadyVoted(bytes32 jobId, address voter);
    error ProposalNotFound(bytes32 jobId);
    error ProposalAlreadyExecuted(bytes32 jobId);
    error UpgradeRejectedByDAO(bytes32 jobId);
    
    /**
     * @dev Constructor sets the SoulvanCoin token address
     * @param _soulvanCoinAddress Address of the deployed SoulvanCoin ERC20 contract
     */
    constructor(address _soulvanCoinAddress) {
        require(_soulvanCoinAddress != address(0), "Invalid token address");
        soulvanCoin = IERC20(_soulvanCoinAddress);
    }
    
    /**
     * @notice Create a new upgrade proposal for a render job
     * @param jobId Unique identifier for the render job
     */
    function createProposal(bytes32 jobId) external {
        require(soulvanCoin.balanceOf(msg.sender) > 0, "SoulvanCoin required");
        require(proposals[jobId].jobId == bytes32(0), "Proposal already exists");
        
        proposals[jobId] = Proposal({
            jobId: jobId,
            proposer: msg.sender,
            approveCount: 0,
            rejectCount: 0,
            executed: false,
            createdAt: block.timestamp
        });
        
        emit ProposalCreated(jobId, msg.sender);
    }
    
    /**
     * @notice Vote on a render job upgrade
     * @dev Requires voter to hold SoulvanCoin and not have voted previously
     * @param jobId Unique identifier for the render job
     * @param approve True to approve, false to reject
     * @param reason Optional text explanation for the vote
     */
    function voteOnUpgrade(bytes32 jobId, bool approve, string memory reason) public {
        // Check voter holds SoulvanCoin
        if (soulvanCoin.balanceOf(msg.sender) == 0) {
            revert InsufficientSoulvanCoin(msg.sender);
        }
        
        // Check proposal exists
        if (proposals[jobId].jobId == bytes32(0)) {
            revert ProposalNotFound(jobId);
        }
        
        // Check not already executed
        if (proposals[jobId].executed) {
            revert ProposalAlreadyExecuted(jobId);
        }
        
        // Check hasn't already voted
        if (hasVoted[jobId][msg.sender]) {
            revert AlreadyVoted(jobId, msg.sender);
        }
        
        // Record vote
        votes[jobId].push(Vote({
            voter: msg.sender,
            approve: approve,
            reason: reason,
            timestamp: block.timestamp
        }));
        
        // Update tally
        if (approve) {
            proposals[jobId].approveCount++;
        } else {
            proposals[jobId].rejectCount++;
        }
        
        // Mark as voted
        hasVoted[jobId][msg.sender] = true;
        
        emit VoteCast(jobId, msg.sender, approve, reason);
    }
    
    /**
     * @notice Apply upgrade if approved by majority vote
     * @dev Anyone can call this, but it requires approve > reject
     * @param jobId Unique identifier for the render job
     */
    function applyUpgrade(bytes32 jobId) public {
        Proposal storage proposal = proposals[jobId];
        
        // Validate proposal state
        if (proposal.jobId == bytes32(0)) {
            revert ProposalNotFound(jobId);
        }
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(jobId);
        }
        
        uint256 approveCount = proposal.approveCount;
        uint256 rejectCount = proposal.rejectCount;
        
        // Check majority approval
        if (approveCount <= rejectCount) {
            revert UpgradeRejectedByDAO(jobId);
        }
        
        // Mark as executed
        proposal.executed = true;
        
        // Trigger personalization logic here (in production, emit event for off-chain processor)
        emit UpgradeApplied(jobId, approveCount, rejectCount);
        
        // NOTE: In production, this would interact with:
        // 1. Off-chain render service to apply personalization
        // 2. IPFS/S3 to update artifact metadata
        // 3. NFT minting contract to create final asset
    }
    
    /**
     * @notice Get vote tally for a job
     * @param jobId Unique identifier for the render job
     * @return approveCount Number of approval votes
     * @return rejectCount Number of rejection votes
     * @return executed Whether the upgrade has been applied
     */
    function getTally(bytes32 jobId) external view returns (
        uint256 approveCount,
        uint256 rejectCount,
        bool executed
    ) {
        Proposal memory proposal = proposals[jobId];
        return (proposal.approveCount, proposal.rejectCount, proposal.executed);
    }
    
    /**
     * @notice Get all votes for a specific job
     * @param jobId Unique identifier for the render job
     * @return Array of Vote structs
     */
    function getVotes(bytes32 jobId) external view returns (Vote[] memory) {
        return votes[jobId];
    }
    
    /**
     * @notice Check if an address has voted on a job
     * @param jobId Unique identifier for the render job
     * @param voter Address to check
     * @return True if voted, false otherwise
     */
    function hasVotedOnJob(bytes32 jobId, address voter) external view returns (bool) {
        return hasVoted[jobId][voter];
    }
    
    /**
     * @notice Get total vote count for a job
     * @param jobId Unique identifier for the render job
     * @return Total number of votes cast
     */
    function getVoteCount(bytes32 jobId) external view returns (uint256) {
        return votes[jobId].length;
    }
}
