// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICompanyToken.sol";
import "./ICryptoTrophyToken.sol";

contract CompanyToken is ERC20, Ownable, ICompanyToken {
    address public cryptoTrophyToken;
    uint256 public ethReserve;
    uint256 public exchangeRate; // ETH per token

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint256 _initialEthBacking,
        address _cryptoTrophyToken
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        _mint(msg.sender, _initialSupply * 10 ** decimals());
        ethReserve = _initialEthBacking;
        cryptoTrophyToken = _cryptoTrophyToken;
        exchangeRate = _initialEthBacking / _initialSupply; // Simplified rate
    }

    function increaseEthBacking() external payable onlyOwner {
        ethReserve += msg.value;
    }

    function decreaseEthBacking(uint256 amount) external onlyOwner {
        require(amount <= ethReserve, "Insufficient ETH reserve");
        ethReserve -= amount;
        payable(msg.sender).transfer(amount);
    }

    function getTokenValueInETH() public view returns (uint256) {
        return exchangeRate;
    }

    function exchangeForCryptoTrophies(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        uint256 ethValue = amount * exchangeRate;
        require(ethValue <= ethReserve, "Insufficient ETH reserve");

        _transfer(msg.sender, address(this), amount);
        ethReserve -= ethValue;

        ICryptoTrophyToken(cryptoTrophyToken).mint(msg.sender, ethValue);
    }
}