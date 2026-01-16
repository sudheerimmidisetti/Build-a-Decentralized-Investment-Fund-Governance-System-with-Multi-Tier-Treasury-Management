// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingPower
 * @notice Anti-whale voting power calculation (sqrt-weighted)
 */
library VotingPower {
    function calculate(uint256 stake) internal pure returns (uint256) {
        return sqrt(stake * 1e18);
    }

    function sqrt(uint256 x) private pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
