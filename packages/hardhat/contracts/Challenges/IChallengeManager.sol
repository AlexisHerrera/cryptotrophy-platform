// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IChallengeManager {
    function createChallenge(
        uint256 _orgId,
        string memory _description,
        uint256 _prizeAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxWinners
    ) external returns (uint256);

    function setChallengeValidator(
        uint256 _challengeId,
        address _validatorAddr,
        bytes32 _validatorUID,
        uint256 _validationId
    ) external;

    function getOrganizationId(uint256 _challengeId) external view returns (uint256);
}
