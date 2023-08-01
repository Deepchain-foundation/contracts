import { assert, expect } from "chai";
import { ethers } from "hardhat";

describe("MyTokenBatchTransfer 合约", function () {
  let MyTokenBatchTransfer;
  let myTokenBatchTransfer;
  let myToken;
  let owner;
  let recipient1;
  let recipient2;

  // 在每个测试用例运行之前，部署合约和获取账户
  beforeEach(async function () {
    // 部署 MyTokenBatchTransfer 合约
    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy(
      "MyToken",
      "MTK",
      ethers.parseEther("1000")
    );
    myToken = token;
    const TokenBatchTransfer = await ethers.getContractFactory(
      "MyTokenBatchTransfer"
    );
    [owner, recipient1, recipient2] = await ethers.getSigners();
    const tokenBatchTransfer = await TokenBatchTransfer.connect(owner).deploy(
      token.getAddress()
    );
    myTokenBatchTransfer = tokenBatchTransfer;

    await myToken.waitForDeployment();
    await myTokenBatchTransfer.waitForDeployment();
  });

  it("进行批量转账", async function () {
    const transferAmount1 = 4000;
    const transferAmount2 = 5000;
    console.log(
      "owners, ",
      owner.address,
      recipient1.address,
      recipient2.address
    );
    const beforeownerBalance = await myToken.balanceOf(owner.address);
    console.log("beforeownerBalance, ", beforeownerBalance.toString());
    const beforerecipient1Balance = await myToken.balanceOf(recipient1.address);
    const beforerecipient2Balance = await myToken.balanceOf(recipient2.address);

    // 确保测试账户已经授权了足够的代币给 MyTokenBatchTransfer 合约
    await myToken
      .connect(owner)
      .approve(myTokenBatchTransfer.getAddress(), ethers.MaxUint256);

    await myTokenBatchTransfer.batchTransfer(
      [recipient1.address, recipient2.address],
      [transferAmount1, transferAmount2]
    );

    // 监听事件
    const transferEvents = await myTokenBatchTransfer.queryFilter(
      "TransferSuccess"
    );
    const contractTransfer = transferEvents.map((event) => {
      return {
        from: event.args.from,
        to: event.args.to,
        amount: event.args.amount.toString(),
      };
    });

    // 检查转账后的余额
    const ownerBalance = await myToken.balanceOf(owner.address);
    const recipient1Balance = await myToken.balanceOf(recipient1.address);
    const recipient2Balance = await myToken.balanceOf(recipient2.address);

    // 使用 BigNumber 来进行加法计算，然后断言检查期望的余额
    assert.equal(
      ownerBalance.toString(),
      BigInt(beforeownerBalance) -
        BigInt(transferAmount1) -
        BigInt(transferAmount2),
      "Owner 的余额错误"
    );
    assert.equal(
      recipient1Balance.toString(),
      BigInt(beforerecipient1Balance) + BigInt(transferAmount1),
      "Recipient1 的余额错误"
    );
    assert.equal(
      recipient2Balance,
      beforerecipient2Balance + BigInt(transferAmount2),
      "Recipient2 的余额错误"
    );
  });
});
