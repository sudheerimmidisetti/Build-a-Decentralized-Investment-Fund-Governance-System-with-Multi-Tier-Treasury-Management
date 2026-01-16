// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Delegation
 * @notice Allows members to delegate voting power to another address
 */
contract Delegation {
    mapping(address => address) public delegateOf;

    event Delegated(address indexed delegator, address indexed delegate);
    event DelegationRevoked(address indexed delegator);

    /**
     * @notice Delegate voting power to another address
     */
    function delegate(address to) external {
        require(to != msg.sender, "Cannot delegate to self");
        delegateOf[msg.sender] = to;
        emit Delegated(msg.sender, to);
    }

    /**
     * @notice Revoke delegation
     */
    function revokeDelegation() external {
        delegateOf[msg.sender] = address(0);
        emit DelegationRevoked(msg.sender);
    }
}
