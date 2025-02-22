// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


interface ITwoStepValidator {
    enum ValidationState{ NOSTATE, PREVALIDATION, SUCCESS, FAIL }

    function getValidationState(uint256 validationId) external returns (string memory);

    function preValidation(uint256 validationId, bytes calldata preValidationParams) external returns (bytes32);
}
