// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IChallengeManager {
    function onTokensReceivedAndCreateChallenge(
        uint256 _orgId,
        string memory _description,
        uint256 _prizeAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxWinners
    ) external;
}
