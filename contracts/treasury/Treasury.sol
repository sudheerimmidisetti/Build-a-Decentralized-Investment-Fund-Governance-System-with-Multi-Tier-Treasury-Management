// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../access/Roles.sol";

/**
 * @title Treasury
 * @notice Holds and manages DAO funds by category
 */
contract Treasury {
    Roles public roles;

    // categoryId => balance
    mapping(uint256 => uint256) public balances;

    event FundsAllocated(uint256 indexed category, uint256 amount);
    event FundsTransferred(
        uint256 indexed category,
        address indexed to,
        uint256 amount
    );

    constructor(address rolesAddress) {
        roles = Roles(rolesAddress);
    }

    /**
     * @notice Receive ETH directly
     */
    receive() external payable {}

    /**
     * @notice Allocate ETH into a specific fund category
     */
    function allocate(uint256 category) external payable {
        require(msg.value > 0, "Zero value");
        balances[category] += msg.value;

        emit FundsAllocated(category, msg.value);
    }

    /**
     * @notice Transfer funds (only executor role)
     */
    function transferFunds(
        uint256 category,
        address to,
        uint256 amount
    ) external {
        require(
            roles.hasRole(roles.EXECUTOR_ROLE(), msg.sender),
            "Not executor"
        );
        require(to != address(0), "Invalid recipient");
        require(balances[category] >= amount, "Insufficient funds");

        balances[category] -= amount;
        payable(to).transfer(amount);

        emit FundsTransferred(category, to, amount);
    }
}
