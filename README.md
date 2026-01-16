# CryptoVentures DAO – Governance & Treasury Management System

## Overview
CryptoVentures DAO is a decentralized investment fund governance system designed to help token holders collectively manage treasury allocations and investment decisions. The system mirrors real-world DAO governance patterns used by protocols like Compound, Aave, and MakerDAO.

This project focuses on solving real governance challenges such as whale dominance, slow approvals, security risks in execution, and inefficient fund management across different investment categories.

---

## Key Features
- ETH-based treasury with stake-weighted governance power  
- Anti-whale voting mechanism to prevent single-entity dominance  
- Multiple proposal types with different quorum and approval thresholds  
- Full proposal lifecycle: Draft → Active → Queued → Executed / Defeated  
- Delegated voting with revocation support  
- Timelocked execution with configurable delays  
- Multi-tier treasury management (High-Conviction, Experimental, Operational)  
- Emergency controls for pausing and proposal cancellation  
- Role-based access control (Proposer, Voter, Executor, Guardian)  
- On-chain queryable proposal history and voting records  

---

## Architecture Overview
The system is composed of modular smart contracts:
- Governance Contracts: proposal creation, voting, delegation, lifecycle management  
- Treasury Contracts: fund accounting, category limits, and execution  
- Access Control: role-based permissions and emergency controls  

Each concern is isolated to ensure clarity, security, and upgrade flexibility.

---

## Proposal Lifecycle
1. Draft / Pending – Proposal created  
2. Active – Voting window open  
3. Queued – Approved proposals enter timelock  
4. Executed – Funds transferred after delay  
5. Defeated – Rejected or expired proposals  

---

## Voting & Delegation
Voting power is derived from staked ETH using a diminishing-return model to reduce whale dominance. Members can delegate voting power to trusted addresses, which is automatically counted when the delegate votes.

---

## Treasury Management
The treasury is split into multiple pools:
- High-Conviction Investments  
- Experimental Bets  
- Operational Expenses  

Each pool has its own limits, approval thresholds, and timelock rules.

---

## Security Considerations
- Timelock delays prevent rushed or malicious executions  
- Emergency roles can pause the system or cancel queued proposals  
- Proposals cannot be executed more than once  
- Graceful failure on insufficient treasury balance  
- Comprehensive event emission for transparency  

---

## Project Structure
contracts/
- governance/
  - Delegation.sol
  - Governance.sol
  - ProposalTypes.sol
  - VotingPower.sol
- treasury/
  - Treasury.sol
- access/
  - Roles.sol

scripts/
- deploy.ts
- seed.ts

test/
- 01.roles.test.ts
- 02.treasury.test.ts
- 03.staking-votingpower.test.ts
- 04.proposal-lifecycle.test.ts
- 05.delegation.test.ts
- 06.timelock-execution.test.ts

---

## Setup Instructions

Install dependencies:
npm install

Configure environment:
cp .env.example .env

Start local blockchain:
npx hardhat node

Deploy contracts:
npx hardhat run scripts/deploy.ts --network localhost

Run tests:
npx hardhat test

---
