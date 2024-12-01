// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoTrophyToken.sol";

contract CryptoTrophyExchange is Ownable {
    address public cryptoTrophyToken;
    uint256 public ethReserve;

    constructor(address _cryptoTrophyToken) Ownable(msg.sender) {
        cryptoTrophyToken = _cryptoTrophyToken;
    }

    function depositETH() external payable onlyOwner {
        ethReserve += msg.value;
    }

    function withdrawETH(uint256 amount) external onlyOwner {
        require(amount <= ethReserve, "Insufficient ETH reserve");
        ethReserve -= amount;
        payable(msg.sender).transfer(amount);
    }

    function exchangeCryptoTrophiesForETH(uint256 amount) external {
        uint256 ethValue = amount * (1 ether / 100); // Simplified fixed rate
        require(ethValue <= ethReserve, "Insufficient ETH reserve");

        ICryptoTrophyToken(cryptoTrophyToken).burn(msg.sender, amount);
        ethReserve -= ethValue;
        payable(msg.sender).transfer(ethValue);
    }
}