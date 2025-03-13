// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "../../Challenges/IValidator.sol";
import "./ITwoStepValidator.sol";


abstract contract TwoStepValidator is IValidator, ITwoStepValidator {

    // keccak256(abi.encodePacked(validationId, user account)) -> claimed 
    mapping(bytes32 => ValidationState) public claimState;
    // request id -> keccak256(abi.encodePacked(validationId, user account))
    mapping(bytes32 => bytes32) public validationRequest;

    // Debug info
    bytes32 public lastRequestId;

    function getValidationState(uint256 validationId) public view override returns (string memory) {
        bytes32 claimUID = keccak256(abi.encodePacked(validationId, msg.sender));
        ValidationState state = claimState[claimUID];
        string memory state_str;
        if (state == ValidationState.PREVALIDATION) {
            state_str = "PREVALIDATION";
        } else if (state == ValidationState.SUCCESS) {
            state_str = "SUCCESS";
        } else if (state == ValidationState.FAIL) {
            state_str = "FAIL";
        } else {
            state_str = "NOSTATE";
        }
        return string.concat("{\"state\": \"", state_str, "\"}");
    }

    function validate(uint256 validationId, bytes calldata params) public view override returns (bool) {
        (address[1] memory sender) = abi.decode(params, (address[1]));
        bytes32 claimUID = keccak256(abi.encodePacked(validationId, sender[0]));
        return claimState[claimUID] == ValidationState.SUCCESS;
    }
}
