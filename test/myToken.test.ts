import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyToken", function () {
  let MyToken;
  let myToken;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("MyToken");
    const [owner, recipient] = await ethers.getSigners();

    const token = await Token.deploy(
      "My Token",
      "MTK",
      ethers.parseEther("1000")
    );
    myToken = token;
    await myToken.waitForDeployment();
  });

  it("should have correct symbol name, and initial supply", async function () {
    const name = await myToken.name();
    const symbol = await myToken.symbol();
    const totalSupply = await myToken.totalSupply();

    expect(name).to.equal("My Token");
    expect(symbol).to.equal("MTK");
    expect(totalSupply).to.equal(ethers.parseEther("1000"));
  });
});
