// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OrganizationToken is ERC20, Ownable, ERC20Burnable, ReentrancyGuard {
    bool public redemptionEnabled;
    
    event RedemptionEnabled(bool enabled);
    event TokensRedeemed(address indexed user, uint256 tokenAmount, uint256 ethAmount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialRecipient
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(initialRecipient, initialSupply * (10 ** decimals()));
        redemptionEnabled = false;
    }

    // Allow contract to receive ETH
    receive() external payable onlyOwner {
        redemptionEnabled = true;
    }

    function getCurrentExchangeRate() public view returns (uint256) {
        require(totalSupply() > 0, "No tokens in circulation");
        require(address(this).balance > 0, "No ETH available for redemption");
        return totalSupply() / address(this).balance;
    }

    function redeemTokensForEth(uint256 tokenAmount) external nonReentrant {
        require(redemptionEnabled, "Redemption not enabled");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(address(this).balance > 0, "No ETH available for redemption");

        uint256 currentRate = getCurrentExchangeRate();
        uint256 ethAmount = tokenAmount / currentRate;
        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");

        // Burn tokens first
        _burn(msg.sender, tokenAmount);

        // Transfer ETH to user
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit TokensRedeemed(msg.sender, tokenAmount, ethAmount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}