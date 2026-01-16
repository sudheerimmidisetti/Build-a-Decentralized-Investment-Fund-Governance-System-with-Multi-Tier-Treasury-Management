import { expect } from "chai";
import { ethers } from "hardhat";

describe("Timelock & Execution", function () {
  let governance: any;
  let treasury: any;
  let roles: any;
  let owner: any;
  let alice: any;

  beforeEach(async () => {
    [owner, alice] = await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(owner.address);

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await roles.getAddress());

    const Governance = await ethers.getContractFactory("Governance");
    governance = await Governance.deploy(
      await treasury.getAddress(),
      await roles.getAddress()
    );

    // grant executor role
    await roles.grantRole(
      await roles.EXECUTOR_ROLE(),
      owner.address
    );

    // stake enough ETH to satisfy quorum
    await governance.connect(owner).deposit({
      value: ethers.parseEther("10"),
    });
    await governance.connect(alice).deposit({
      value: ethers.parseEther("5"),
    });

    // fund treasury
    await treasury.allocate(0, {
      value: ethers.parseEther("5"),
    });

    // create proposal
    await governance
      .connect(owner)
      .createProposal(
        owner.address,
        ethers.parseEther("1"),
        0,
        "Timelock test"
      );

    // BOTH vote → quorum satisfied
    await governance.connect(owner).vote(1, 1);
    await governance.connect(alice).vote(1, 1);

    // now queue should succeed
    await governance.queue(1);
  });

  it("prevents execution before timelock", async () => {
    await expect(
      governance.execute(1)
    ).to.be.revertedWith("Timelock active");
  });
});
