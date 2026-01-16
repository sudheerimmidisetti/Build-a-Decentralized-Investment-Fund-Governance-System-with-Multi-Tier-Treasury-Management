// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @notice Risk categories for proposals
 */
enum ProposalType {
    HIGH_CONVICTION, // large, high-risk investments
    EXPERIMENTAL,    // medium risk bets
    OPERATIONAL      // small recurring expenses
}

/**
 * @notice Governance thresholds per proposal type
 */
struct Threshold {
    uint256 quorum;     // % in basis points (e.g. 2000 = 20%)
    uint256 approval;   // % in basis points
    uint256 timelock;   // execution delay in seconds
}
