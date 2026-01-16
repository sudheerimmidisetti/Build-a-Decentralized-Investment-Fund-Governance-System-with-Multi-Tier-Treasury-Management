import { ethers } from "hardhat";

async function main() {
  const [owner, alice, bob, charlie] = await ethers.getSigners();

  // ⚠️ PASTE ADDRESSES FROM deploy.ts OUTPUT
  const GOVERNANCE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const TREASURY_ADDRESS   = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const governance = await ethers.getContractAt(
    "Governance",
    GOVERNANCE_ADDRESS
  );
  const treasury = await ethers.getContractAt("Treasury", TREASURY_ADDRESS);

  console.log("Seeding DAO state...");

  // Stake ETH
  await governance.connect(alice).deposit({
    value: ethers.parseEther("5"),
  });
  await governance.connect(bob).deposit({
    value: ethers.parseEther("2"),
  });
  await governance.connect(charlie).deposit({
    value: ethers.parseEther("1"),
  });

  console.log("Members staked");

  // Fund treasury categories
  await treasury.allocate(0, { value: ethers.parseEther("5") });
  await treasury.allocate(1, { value: ethers.parseEther("3") });
  await treasury.allocate(2, { value: ethers.parseEther("2") });

  console.log("Treasury funded");

  // Create sample proposals
  await governance
    .connect(alice)
    .createProposal(
      bob.address,
      ethers.parseEther("1"),
      0,
      "High conviction investment"
    );

  await governance
    .connect(bob)
    .createProposal(
      charlie.address,
      ethers.parseEther("0.5"),
      2,
      "Operational expense"
    );

  console.log("Proposals created");

  console.log("✅ DAO seeded successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
