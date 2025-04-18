// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "hardhat/console.sol";
import "../Organization/IOrganizationManager.sol";
import {IValidator} from "./IValidator.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IChallengeManager} from "./IChallengeManager.sol";

contract ChallengeManager is IChallengeManager {
    struct Challenge {
        uint256 id;
        string description;

        bytes32 validatorUID;
        address validatorAddr;
        uint256 validationId;

        uint256 prizeAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 maxWinners;
        bool active;
        uint256 winnerCount;
        uint256 orgId;
        mapping(address => bool) winners;
        bool exists;
    }

    uint256 public challengeCount;
    mapping(uint256 => Challenge) public challenges;
    uint256[] public challengeIds;
    mapping(uint256 => uint256[]) public orgChallenges;

    IOrganizationManager public orgManager;

    event ChallengeCreated(uint256 indexed challengeId, string description);
    event RewardClaimed(uint256 indexed challengeId, address indexed user);

    constructor(address _orgManagerAddr) {
        orgManager = IOrganizationManager(_orgManagerAddr);
    }

    modifier onlyAdmin(uint256 orgId) {
        require(orgManager.isAdmin(orgId, msg.sender), "Not an admin");
        _;
    }

    function getOrganizationId(uint256 _challengeId) external view returns (uint256) {
        return challenges[_challengeId].orgId;
    }

    function createChallenge(
        uint256 _orgId,
        string memory _description,
        uint256 _prizeAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxWinners
    ) public override onlyAdmin(_orgId) {
        // 1. Validar que msg.sender sea admin de la org
        require(orgManager.isAdmin(_orgId, msg.sender), "Not an admin");

        // 2. Validar tiempos
        require(_startTime < _endTime, "Invalid time range");

        // 3. Calcular total de tokens
        uint256 totalPrizeAmount = _prizeAmount * _maxWinners;

        // 4. Solicitar a la OrgManager que transfiera los tokens al contrato
        orgManager.transferTokensTo(_orgId, address(this), totalPrizeAmount);

        // 5. Registrar el challenge en storage
        uint256 challengeId = challengeCount++;
        Challenge storage challenge = challenges[challengeId];
        challenge.id = challengeId;
        challenge.description = _description;
        challenge.prizeAmount = _prizeAmount;
        challenge.winnerCount = 0;
        challenge.startTime = _startTime;
        challenge.endTime = _endTime;
        challenge.maxWinners = _maxWinners;
        challenge.orgId = _orgId;
        challenge.active = true;
        challenge.exists = true;
        challenge.validatorUID = bytes32(0);

        orgChallenges[_orgId].push(challengeId);
        challengeIds.push(challengeId);

        emit ChallengeCreated(challengeId, _description);
    }

    function getChallengesByOrg(uint256 _orgId) public view returns (uint256[] memory) {
        return orgChallenges[_orgId];
    }

    function setChallengeValidator(
        uint256 _challengeId,
        address _validatorAddr,
        bytes32 _validatorUID,
        uint256 _validationId
    ) public override {
		// TODO require(msg.sender == address(validatorManagerAddr), "Only ChallengeManager can call or admin");
        // require(orgManager.isAdmin(challenge.orgId, msg.sender), "Not an admin");

        Challenge storage challenge = challenges[_challengeId];
        challenge.validatorAddr = _validatorAddr;
        challenge.validationId = _validationId;
        challenge.validatorUID = _validatorUID;
    }

    /// @notice Reclama un premio de un desafío
    function claimReward(
        uint256 _challengeId,
        bytes calldata params
    ) external { // TODO: check only user
        Challenge storage challenge = challenges[_challengeId];
        require(challenge.exists, "Challenge does not exist");
        require(challenge.active, "Challenge not active");
        require(
            block.timestamp >= challenge.startTime,
            "Challenge not started"
        );
        require(block.timestamp <= challenge.endTime, "Challenge ended");
        require(
            challenge.winnerCount < challenge.maxWinners,
            "Max winners reached"
        );
        require(!challenge.winners[msg.sender], "Already claimed");

        if (challenge.validatorAddr != address(0x0)) {
            IValidator validator = IValidator(challenge.validatorAddr);
            require(validator.validate(challenge.validationId, params), "Validation failed");
        }

        uint256 prizeAmountInBaseUnits = challenge.prizeAmount;
        address orgToken = orgManager.getTokenOfOrg(challenge.orgId);

        require(
            ERC20(orgToken).balanceOf(address(this)) >= prizeAmountInBaseUnits,
            "Not enough tokens in the challenge contract"
        );

        challenge.winners[msg.sender] = true;
        challenge.winnerCount++;

        // Si se alcanzó el número máximo de ganadores, marcar el desafío como inactivo
        if (challenge.winnerCount >= challenge.maxWinners) {
            challenge.active = false;
        }

        // Transferir tokens al ganador
        ERC20(orgToken).transfer(msg.sender, prizeAmountInBaseUnits);

        emit RewardClaimed(_challengeId, msg.sender);
    }

    /// @notice Obtiene los detalles de múltiples desafíos
    /// @param ids Lista de IDs de los desafíos
    /// @return retChallengeIds Lista de IDs de los desafíos
    /// @return descriptions Lista de descripciones de los desafíos
    /// @return prizeAmounts Lista de montos de premios de los desafíos
    /// @return startTimes Lista de tiempos de inicio de los desafíos
    /// @return endTimes Lista de tiempos de finalización de los desafíos
    /// @return maxWinners Lista de máximos ganadores permitidos de los desafíos
    /// @return actives Lista de estados de los desafíos (activos o inactivos)
    /// @return winnerCounts Lista de conteos de ganadores actuales de los desafíos
    function listChallengesDetails(uint256[] calldata ids)
    external
    view
    returns (
        uint256[] memory retChallengeIds,
        string[] memory descriptions,
        uint256[] memory prizeAmounts,
        uint256[] memory startTimes,
        uint256[] memory endTimes,
        uint256[] memory maxWinners,
        bool[] memory actives,
        uint256[] memory winnerCounts,
        bytes32[] memory validatorUID
    )
    {
        uint256 count = ids.length;

        retChallengeIds = new uint256[](count);
        descriptions = new string[](count);
        prizeAmounts = new uint256[](count);
        startTimes = new uint256[](count);
        endTimes = new uint256[](count);
        maxWinners = new uint256[](count);
        actives = new bool[](count);
        winnerCounts = new uint256[](count);
        validatorUID = new bytes32[](count);

        for (uint256 i = 0; i < count; i++) {
            Challenge storage challenge = challenges[ids[i]];
            require(challenge.exists, "Challenge does not exist");

            retChallengeIds[i] = challenge.id;
            descriptions[i] = challenge.description;
            prizeAmounts[i] = challenge.prizeAmount;
            startTimes[i] = challenge.startTime;
            endTimes[i] = challenge.endTime;
            maxWinners[i] = challenge.maxWinners;
            actives[i] = challenge.active;
            winnerCounts[i] = challenge.winnerCount;
            validatorUID[i] = challenge.validatorUID;
        }
    }

    /// @notice Calcula la cantidad de tokens disponibles para crear desafíos (en unidades base)
    function tokensAvailable(uint256 _orgId) public view returns (uint256) {
        uint256 tokenBalance = orgManager.getBalanceOfOrg(_orgId);
        console.log("Token balance:", tokenBalance);

        uint256 committedTokens = 0;

        uint256[] storage orgChalls = orgChallenges[_orgId];
        console.log("Organization challenges:", orgChalls.length);

        for (uint256 i = 0; i < orgChalls.length; i++) {
            uint256 cId = orgChalls[i];
            Challenge storage challenge = challenges[cId];
            if (challenge.active) {
                uint256 stillNeeded = challenge.prizeAmount * (challenge.maxWinners - challenge.winnerCount);
                committedTokens += stillNeeded;
            }
        }

        return tokenBalance >= committedTokens ? tokenBalance - committedTokens : 0;
    }

}
