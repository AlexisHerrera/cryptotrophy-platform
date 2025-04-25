// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


interface IValidatorCallback {
    function validatorClaimCallback(bytes32 _validatorUID, uint256 _validationId, address _claimer) external;
}


interface IValidator {

	function setConfigFromParams(uint256 _validationId, bytes calldata _params) external; 

    function validate(uint256 _validationId, bytes calldata _validationParams) external returns (bool);
}
