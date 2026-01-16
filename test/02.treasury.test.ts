import { expect } from "chai";
import { ethers } from "hardhat";

describe("Treasury", function () {
  let treasury: any;
  let roles: any;
  let executor: any;
  let user: any;

  beforeEach(async () => {
    [executor, user] = await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(executor.address);

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await roles.getAddress());

    await roles.grantRole(
      await roles.EXECUTOR_ROLE(),
      executor.address
    );
  });

  it("accepts ETH allocation", async () => {
    await treasury.allocate(0, {
      value: ethers.parseEther("1"),
    });

    expect(await treasury.balances(0)).to.equal(
      ethers.parseEther("1")
    );
  });

  it("prevents non-executor from transferring funds", async () => {
    await expect(
      treasury.connect(user).transferFunds(0, user.address, 1)
    ).to.be.revertedWith("Not executor");
  });

  it("fails gracefully on insufficient funds", async () => {
    await expect(
      treasury.transferFunds(0, executor.address, 10)
    ).to.be.revertedWith("Insufficient funds");
  });
});
