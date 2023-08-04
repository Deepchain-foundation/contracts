const { assert } = require("chai");
const { ethers } = require("hardhat");


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
    MyTokenBatchTransfer = await ethers.getContractFactory("MyTokenBatchTransfer");
    [owner, recipient1, recipient2] = await ethers.getSigners();
    myTokenBatchTransfer = await MyTokenBatchTransfer.connect(owner).deploy("0x25100e2adC08B2956C8f5AecE6F0928f65f315E0");
    await myTokenBatchTransfer.deployed();

    // 获取代币地址
   myToken = await ethers.getContractAt("IERC20", await myTokenBatchTransfer.myToken());
  });

  it("进行批量转账", async function () {
    const transferAmount1 = 4000;
    const transferAmount2 = 5000;
    const beforeownerBalance = await myToken.balanceOf(owner.address);
    const beforerecipient1Balance = await myToken.balanceOf(recipient1.address);
    const beforerecipient2Balance = await myToken.balanceOf(recipient2.address);

    console.log(owner.address);
    console.log(recipient1.address);
    console.log(recipient2.address);
    console.log(myTokenBatchTransfer.address);

    // 确保测试账户已经授权了足够的代币给 MyTokenBatchTransfer 合约
    await myToken.connect(owner).approve(myTokenBatchTransfer.address, ethers.constants.MaxUint256);
    
    try {
    await myTokenBatchTransfer.batchTransfer(
        [recipient1.address, recipient2.address],
        [transferAmount1, transferAmount2]
      );
    } catch (error) {
      console.log(error);
    }

    // 监听事件
    const transferEvents = await myTokenBatchTransfer.queryFilter("TransferSuccess");
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
    const recipient1Balance = await myToken.balanceOf(recipient1.address);
    const recipient2Balance = await myToken.balanceOf(recipient2.address);

    // 使用 BigNumber 来进行加法计算，然后断言检查期望的余额
    const BigNumber = ethers.BigNumber;
    assert.equal(
      ownerBalance.toString(),
      beforeownerBalance.sub(BigNumber.from(transferAmount1).add(BigNumber.from(transferAmount2))).toString(),
      "Owner 的余额错误"
    );
    assert.equal(
      recipient1Balance.toString(),
      beforerecipient1Balance.add(BigNumber.from(transferAmount1)).toString(),
      "Recipient1 的余额错误"
    );
    assert.equal(
      recipient2Balance.toString(),
      beforerecipient2Balance.add(BigNumber.from(transferAmount2)).toString(),
      "Recipient2 的余额错误"
    );
  });

});
