import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await deployer.provider!.getBalance(deployer.address))
  );

  // 1. Deploy Roles
  const Roles = await ethers.getContractFactory("Roles");
  const roles = await Roles.deploy(deployer.address);
  await roles.waitForDeployment();

  console.log("Roles deployed to:", await roles.getAddress());

  // 2. Deploy Treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(await roles.getAddress());
  await treasury.waitForDeployment();

  console.log("Treasury deployed to:", await treasury.getAddress());

  // 3. Deploy Governance
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(
    await treasury.getAddress(),
    await roles.getAddress()
  );
  await governance.waitForDeployment();

  console.log("Governance deployed to:", await governance.getAddress());

  // 4. Grant EXECUTOR_ROLE to Governance
  const EXECUTOR_ROLE = await roles.EXECUTOR_ROLE();
  const tx = await roles.grantRole(
    EXECUTOR_ROLE,
    await governance.getAddress()
  );
  await tx.wait();

  console.log("Executor role granted to Governance");

  console.log("\n✅ Deployment complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
