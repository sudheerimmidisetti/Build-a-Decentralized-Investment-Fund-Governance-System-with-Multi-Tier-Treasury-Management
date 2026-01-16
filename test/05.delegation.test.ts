import { expect } from "chai";
import { ethers } from "hardhat";

describe("Delegation", function () {
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
  });

  it("allows delegation and revocation", async () => {
    await governance.connect(alice).delegate(bob.address);
    expect(await governance.delegateOf(alice.address)).to.equal(
      bob.address
    );

    await governance.connect(alice).revokeDelegation();
    expect(await governance.delegateOf(alice.address)).to.equal(
      ethers.ZeroAddress
    );
  });
});
