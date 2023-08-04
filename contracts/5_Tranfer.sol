// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyTokenBatchTransfer {
    address public contractOwner;
    IERC20 public myToken;

    // 获取代币地址
    constructor(address tokenAddress) {
        contractOwner = msg.sender;
        myToken = IERC20(tokenAddress);
    }

    // 声明事件
    event TransferSuccess(address indexed from, address indexed to, uint256 amount);

    // 支持批量转账，用户直接调用这个方法进行转账
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Invalid input length");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalAmount += amounts[i];
        }
        require(myToken.balanceOf(msg.sender) >= totalAmount, "Transfer amount exceeds balance");

        // 继续进行转账操作
        for (uint256 i = 0; i < recipients.length; i++) {
            myToken.transferFrom(msg.sender, recipients[i], amounts[i]);

            // 发出事件
            emit TransferSuccess(msg.sender, recipients[i], amounts[i]);
        }
    }


    // 获取合约的余额
    function getContractBalance() external view returns (uint256) {
        return myToken.balanceOf(address(this));
    }

    // 获取指定地址的代币余额
    function getBalance(address account) external view returns (uint256) {
        return myToken.balanceOf(account);
    }
}
