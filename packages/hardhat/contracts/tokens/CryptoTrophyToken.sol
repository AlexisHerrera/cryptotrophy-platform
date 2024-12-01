// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoTrophyToken.sol";

contract CryptoTrophyToken is ERC20, Ownable, ICryptoTrophyToken {

    constructor() ERC20("CryptoTrophyToken", "CTT") Ownable(msg.sender) {}


    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}