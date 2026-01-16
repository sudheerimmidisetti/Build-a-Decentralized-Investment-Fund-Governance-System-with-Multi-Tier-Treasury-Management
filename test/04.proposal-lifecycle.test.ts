import { expect } from "chai";
import { ethers } from "hardhat";

describe("Proposal Lifecycle", function () {
  let governance: any;
  let treasury: any;
  let roles: any;
  let alice: any;
  let bob: any;

  beforeEach(async () => {
    [, alice, bob] = await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(alice.address);

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await roles.getAddress());

    const Governance = await ethers.getContractFactory("Governance");
    governance = await Governance.deploy(
      await treasury.getAddress(),
      await roles.getAddress()
    );

    await governance.connect(alice).deposit({
      value: ethers.parseEther("5"),
    });
  });

  it("creates a proposal", async () => {
    await governance
      .connect(alice)
      .createProposal(bob.address, 1, 0, "Test proposal");

    const proposal = await governance.proposals(1);
    expect(proposal.proposer).to.equal(alice.address);
  });

  it("prevents double voting", async () => {
    await governance
      .connect(alice)
      .createProposal(bob.address, 1, 0, "Test");

    await governance.vote(1, 1);

    await expect(governance.vote(1, 1)).to.be.revertedWith(
      "Already voted"
    );
  });
});
