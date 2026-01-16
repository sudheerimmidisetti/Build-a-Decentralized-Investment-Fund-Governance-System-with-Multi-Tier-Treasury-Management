// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProposalTypes.sol";
import "./VotingPower.sol";
import "./Delegation.sol";
import "../treasury/Treasury.sol";
import "../access/Roles.sol";

/**
 * @title Governance
 * @notice Core governance logic for CryptoVentures DAO
 */
contract Governance is Delegation {
    using VotingPower for uint256;

    enum ProposalState {
        Pending,
        Active,
        Queued,
        Executed,
        Defeated
    }

    struct Proposal {
        uint256 id;
        address proposer;
        address recipient;
        uint256 amount;
        ProposalType proposalType;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 queuedAt;
        bool executed;
    }

    uint256 public proposalCount;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    mapping(address => uint256) public stake;
    uint256 public totalStake;

    mapping(ProposalType => Threshold) public thresholds;

    Treasury public treasury;
    Roles public roles;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalType proposalType
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support,
        uint256 votingPower
    );
    event ProposalQueued(uint256 indexed proposalId);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address payable treasuryAddress, address rolesAddress) {
    treasury = Treasury(treasuryAddress);
    roles = Roles(rolesAddress);

        // Threshold defaults (can be tuned later)
        thresholds[ProposalType.HIGH_CONVICTION] =
            Threshold(3000, 6000, 3 days); // 30% quorum, 60% approval
        thresholds[ProposalType.EXPERIMENTAL] =
            Threshold(2000, 5000, 2 days);
        thresholds[ProposalType.OPERATIONAL] =
            Threshold(1000, 5000, 1 days);
    }

    /**
     * @notice Deposit ETH to gain governance power
     */
    function deposit() external payable {
        require(msg.value > 0, "Zero deposit");
        stake[msg.sender] += msg.value;
        totalStake += msg.value;
    }

    /**
     * @notice Returns voting power (anti-whale)
     */
    function votingPower(address user) public view returns (uint256) {
        return stake[user].calculate();
    }

    /**
     * @notice Create a new proposal
     */
    function createProposal(
        address recipient,
        uint256 amount,
        ProposalType proposalType,
        string calldata /* description */
    ) external {
        require(stake[msg.sender] > 0, "No stake");

        proposalCount++;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            recipient: recipient,
            amount: amount,
            proposalType: proposalType,
            startTime: block.timestamp,
            endTime: block.timestamp + 7 days,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            queuedAt: 0,
            executed: false
        });

        emit ProposalCreated(proposalCount, msg.sender, proposalType);
    }

    /**
     * @notice Cast a vote (0=against, 1=for, 2=abstain)
     */
    function vote(uint256 proposalId, uint8 support) external {
        Proposal storage p = proposals[proposalId];

        require(
            block.timestamp >= p.startTime &&
                block.timestamp <= p.endTime,
            "Voting closed"
        );
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 power = votingPower(msg.sender);

        // include delegated power
        address delegator = msg.sender;
        while (delegateOf[delegator] != address(0)) {
            delegator = delegateOf[delegator];
            power += votingPower(delegator);
        }

        if (support == 1) {
            p.forVotes += power;
        } else if (support == 0) {
            p.againstVotes += power;
        } else {
            p.abstainVotes += power;
        }

        hasVoted[proposalId][msg.sender] = true;

        emit VoteCast(proposalId, msg.sender, support, power);
    }

    /**
     * @notice Queue proposal if approved
     */
    function queue(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        Threshold memory t = thresholds[p.proposalType];

        uint256 totalVotes = p.forVotes + p.againstVotes + p.abstainVotes;

        require(
            (totalVotes * 10000) / totalStake >= t.quorum,
            "Quorum not met"
        );
        require(
            (p.forVotes * 10000) / totalVotes >= t.approval,
            "Approval not met"
        );

        p.queuedAt = block.timestamp;
        emit ProposalQueued(proposalId);
    }

    /**
     * @notice Execute proposal after timelock
     */
    function execute(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        Threshold memory t = thresholds[p.proposalType];

        require(!p.executed, "Already executed");
        require(
            block.timestamp >= p.queuedAt + t.timelock,
            "Timelock active"
        );
        require(
            roles.hasRole(roles.EXECUTOR_ROLE(), msg.sender),
            "Not executor"
        );

        p.executed = true;
        treasury.transferFunds(
            uint256(p.proposalType),
            p.recipient,
            p.amount
        );

        emit ProposalExecuted(proposalId);
    }
}
