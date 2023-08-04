import { assert, expect} from "chai";
import { ethers } from "hardhat";

describe("MyTokenBatchTransfer 合约", function () {
  let myTokenBatchTransfer;
  let myToken;
  let owner;
  let recipient1;
  let recipient2;
  const transferAmount1 = 4000;
  const transferAmount2 = 5000;

  // 在每个测试用例运行之前，部署合约和获取账户
  beforeEach(async function () {
    // 部署 MyTokenBatchTransfer 合约
    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy(
      "MyToken",
      "MTK",
      ethers.utils.parseEther("1000")
    );
    myToken = token;
    
    const TokenBatchTransfer = await ethers.getContractFactory("MyTokenBatchTransfer");
    [owner, recipient1, recipient2] = await ethers.getSigners();
    
    const tokenBatchTransfer = await TokenBatchTransfer.connect(owner).deploy(token.address);
    myTokenBatchTransfer = tokenBatchTransfer;
  });

 it("进行批量转账", async function () {
    console.log(
      "owners",
      owner.address,
      "recipient1",
      recipient1.address,
      "recipient2",
      recipient2.address
    );
    
    // 转账之前各个账户的余额
    const beforeownerBalance = await myToken.balanceOf(owner.address);
    console.log("beforeownerBalance", beforeownerBalance.toString());

    const beforerecipient1Balance = await myToken.balanceOf(recipient1.address);
    console.log("beforerecipient1Balance", beforerecipient1Balance.toString());

    const beforerecipient2Balance = await myToken.balanceOf(recipient2.address);
    console.log("beforerecipient2Balance", beforerecipient2Balance.toString());

    // 确保测试账户已经授权了足够的代币给 MyTokenBatchTransfer 合约
    await myToken
      .connect(owner)
      .approve(myTokenBatchTransfer.address, ethers.constants.MaxUint256);

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
    console.log(contractTransfer)

    // 检查转账后的余额
    const ownerBalance = await myToken.balanceOf(owner.address);
    console.log("ownerBalance", ownerBalance.toString());

    const recipient1Balance = await myToken.balanceOf(recipient1.address);
    console.log("recipient1Balance", recipient1Balance.toString());

    const recipient2Balance = await myToken.balanceOf(recipient2.address);
    console.log("recipient2Balance", recipient2Balance.toString());

    // 检查期望的余额
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
      recipient2Balance.toString(),
      BigInt(beforerecipient2Balance) + BigInt(transferAmount2),
      "Recipient2 的余额错误"
    );
  }); 

 it("进行余额不足的转账", async function () {
    console.log(
      "owners",
      owner.address,
      "recipient1",
      recipient1.address,
      "recipient2",
      recipient2.address
    );

    // 转账之前各个账户的余额
    const beforeownerBalance = await myToken.balanceOf(owner.address);
    console.log("beforeownerBalance", beforeownerBalance.toString());

    const beforerecipient1Balance = await myToken.balanceOf(recipient1.address);
    console.log("beforerecipient1Balance", beforerecipient1Balance.toString());

    const beforerecipient2Balance = await myToken.balanceOf(recipient2.address);
    console.log("beforerecipient2Balance", beforerecipient2Balance.toString());

    // 给 MyTokenBatchTransfer 合约进行授权
    await myToken
      .connect(owner)
      .approve(myTokenBatchTransfer.address, ethers.constants.MaxUint256);
    await expect(
      myTokenBatchTransfer.batchTransfer(
        [recipient1.address, recipient2.address],
        [beforeownerBalance, beforeownerBalance]
      )
    ).to.be.revertedWith("Transfer amount exceeds balance");

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
    console.log(contractTransfer);

    // 检查转账后的余额
    const ownerBalance = await myToken.balanceOf(owner.address);
    console.log("ownerBalance", ownerBalance.toString());

    const recipient1Balance = await myToken.balanceOf(recipient1.address);
    console.log("recipient1Balance", recipient1Balance.toString());

    const recipient2Balance = await myToken.balanceOf(recipient2.address);
    console.log("recipient2Balance", recipient2Balance.toString());

  }); 


  it("未经授权的转账", async function () {
    try{
    await expect(
      myTokenBatchTransfer.connect(owner).batchTransfer(
        [recipient1.address, recipient2.address],
        [transferAmount1, transferAmount2]
      )
    ).to.be.revertedWith("Insufficient allowance");
    }catch (error) {
        // 检查错误消息
        console.log(error.message);
        expect(error.message).to.include("Insufficient allowance");
        console.log("用户未被授权进行转账操作");
        return;
    }
  });

});

