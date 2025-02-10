// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "../Challenges/IChallengeManager.sol";
import "../Organization/IOrganizationManager.sol";


contract ValidatorRegistry {
    IChallengeManager public challangeManager;
    IOrganizationManager public organizationManager;
    mapping(bytes32 => address) public validators;

    constructor(address _organizationManagerAddr, address _challangeManagerAddr) {
        challangeManager = IChallengeManager(_challangeManagerAddr);
        organizationManager = IOrganizationManager(_organizationManagerAddr);
    }

    function registerValidator(bytes32 _validatorUID, address _validatorAddress) public {
        validators[_validatorUID] = _validatorAddress;
    }

    function setChallengeValidator(uint256 _challengeId, bytes32 _validatorUID, uint256 _validationId) public {
        uint256 _orgId = challangeManager.getOrganizationId(_challengeId);
        require(organizationManager.isAdmin(_orgId, msg.sender), "Not an admin");

        address _validatorAddress = validators[_validatorUID];
        require(_validatorAddress != address(0), "Invalid _validatorUID, please register the validator.");

        challangeManager.setChallengeValidator(_challengeId, _validatorAddress, _validatorUID, _validationId);
    }
}
