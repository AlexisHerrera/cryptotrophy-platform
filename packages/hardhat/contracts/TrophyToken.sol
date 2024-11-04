// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract TrophyToken is ERC20, AccessControl {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address defaultAdmin) ERC20("TrophyToken", "TTK") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        address minterAddress = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        _grantRole(MINTER_ROLE, minterAddress);
        _mint(minterAddress, 10 ether);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

}

