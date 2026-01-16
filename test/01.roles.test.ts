import { expect } from "chai";
import { ethers } from "hardhat";

describe("Roles", function () {
  it("assigns admin role correctly", async () => {
    const [admin] = await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    const roles = await Roles.deploy(admin.address);

    expect(
      await roles.hasRole(await roles.DEFAULT_ADMIN_ROLE(), admin.address)
    ).to.equal(true);
  });
});
