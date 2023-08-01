import { expect } from "chai";
import { ethers } from "hardhat";
import { MyToken } from "../typechain-types";

describe("MyToken", function () {
  let myToken: MyToken;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("MyToken");

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
