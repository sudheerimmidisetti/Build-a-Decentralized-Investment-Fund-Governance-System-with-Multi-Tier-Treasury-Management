import { expect } from "chai";
import { ethers } from "hardhat";

describe("Staking & Voting Power", function () {
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

  it("allows users to stake ETH", async () => {
    await governance.connect(alice).deposit({
      value: ethers.parseEther("2"),
    });

    expect(await governance.stake(alice.address)).to.equal(
      ethers.parseEther("2")
    );
  });

  it("reduces whale dominance (sqrt voting)", async () => {
    await governance.connect(alice).deposit({
      value: ethers.parseEther("9"),
    });
    await governance.connect(bob).deposit({
      value: ethers.parseEther("1"),
    });

    const alicePower = await governance.votingPower(alice.address);
    const bobPower = await governance.votingPower(bob.address);

    expect(alicePower / bobPower).to.be.lessThan(4);
  });
});
