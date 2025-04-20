// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "../../Challenges/IValidator.sol";
import "./ITwoStepValidator.sol";



abstract contract TwoStepValidator is IValidator, ITwoStepValidator {
    struct Claim {
        uint256 validationId;
        address claimer;
        ValidationState state;
    }

    // keccak256(abi.encodePacked(validationId, user account)) -> Claim 
    mapping(bytes32 => Claim) public claims;
    // request id -> keccak256(abi.encodePacked(validationId, user account))
    mapping(bytes32 => bytes32) public validationRequest;

    string[4] states = ["NOSTATE", "PREVALIDATION", "SUCCESS", "FAIL"];

    function getValidationState(uint256 validationId) public view override returns (string memory) {
        bytes32 claimUID = keccak256(abi.encodePacked(validationId, msg.sender));
        ValidationState state = claims[claimUID].state;
        string memory stateStr = states[uint8(state)];
        return string(abi.encodePacked('{"state":"', stateStr, '"}'));
    }

    function validate(uint256 validationId, bytes calldata params) public view override returns (bool) {
        (address[1] memory sender) = abi.decode(params, (address[1]));
        bytes32 claimUID = keccak256(abi.encodePacked(validationId, sender[0]));
        return claims[claimUID].state == ValidationState.SUCCESS;
    }
}
