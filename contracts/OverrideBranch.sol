// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title OverrideBranch
 * @dev Community-created branching mission paths for override missions
 */
contract OverrideBranch {
    struct Branch {
        string missionId;
        string choice;         // Player choice text
        string outcome;        // Result description
        address creator;
        uint256 votes;
        bool approved;
        uint256 timestamp;
        string nextMissionId;  // Next mission in branch
        string[] requirements; // Prerequisites
    }

    mapping(uint256 => Branch) public branches;
    mapping(string => uint256[]) public missionBranches;  // missionId => branchIds
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public branchCount;
    uint256 public approvalThreshold = 15;

    event BranchSubmitted(
        uint256 indexed branchId,
        string missionId,
        address indexed creator,
        string choice
    );
    
    event BranchVoted(
        uint256 indexed branchId,
        address indexed voter,
        uint256 totalVotes
    );
    
    event BranchApproved(
        uint256 indexed branchId,
        string missionId
    );

    function submitBranch(
        string memory _missionId,
        string memory _choice,
        string memory _outcome,
        string memory _nextMissionId,
        string[] memory _requirements
    ) public returns (uint256) {
        uint256 branchId = branchCount;

        branches[branchId] = Branch({
            missionId: _missionId,
            choice: _choice,
            outcome: _outcome,
            creator: msg.sender,
            votes: 0,
            approved: false,
            timestamp: block.timestamp,
            nextMissionId: _nextMissionId,
            requirements: _requirements
        });

        missionBranches[_missionId].push(branchId);
        branchCount++;

        emit BranchSubmitted(branchId, _missionId, msg.sender, _choice);

        return branchId;
    }

    function voteBranch(uint256 _branchId) public {
        require(_branchId < branchCount, "Branch does not exist");
        require(!hasVoted[_branchId][msg.sender], "Already voted");

        branches[_branchId].votes++;
        hasVoted[_branchId][msg.sender] = true;

        emit BranchVoted(_branchId, msg.sender, branches[_branchId].votes);

        // Auto-approve at threshold
        if (branches[_branchId].votes >= approvalThreshold && !branches[_branchId].approved) {
            branches[_branchId].approved = true;
            emit BranchApproved(_branchId, branches[_branchId].missionId);
        }
    }

    function approveBranch(uint256 _branchId) public {
        require(_branchId < branchCount, "Branch does not exist");
        branches[_branchId].approved = true;
        emit BranchApproved(_branchId, branches[_branchId].missionId);
    }

    function getBranch(uint256 _branchId) public view returns (Branch memory) {
        require(_branchId < branchCount, "Branch does not exist");
        return branches[_branchId];
    }

    function getMissionBranches(string memory _missionId) public view returns (uint256[] memory) {
        return missionBranches[_missionId];
    }

    function getApprovedBranches(string memory _missionId) public view returns (uint256[] memory) {
        uint256[] memory allBranches = missionBranches[_missionId];
        uint256 approvedCount = 0;

        // Count approved branches
        for (uint256 i = 0; i < allBranches.length; i++) {
            if (branches[allBranches[i]].approved) {
                approvedCount++;
            }
        }

        // Build result array
        uint256[] memory result = new uint256[](approvedCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < allBranches.length; i++) {
            if (branches[allBranches[i]].approved) {
                result[resultIndex] = allBranches[i];
                resultIndex++;
            }
        }

        return result;
    }

    function hasVotedForBranch(uint256 _branchId, address _voter) public view returns (bool) {
        return hasVoted[_branchId][_voter];
    }
}
