// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "../../Challenges/IValidator.sol";
import "./ITwoStepValidator.sol";


contract RandomValidator is IValidator, ITwoStepValidator, VRFConsumerBaseV2Plus {
    // Your subscription ID.
    uint256 immutable s_subscriptionId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 immutable s_keyHash;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 constant CALLBACK_GAS_LIMIT = 100000;

    // The default is 3, but you can set this higher.
    uint16 constant REQUEST_CONFIRMATIONS = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2_5.MAX_NUM_WORDS.
    uint32 constant NUM_WORDS = 2;

    uint256[] public s_randomWords;
    uint256 public s_requestId;

    event ReturnedRandomness(uint256[] randomWords);

    // keccak256(abi.encodePacked(validationId, user account)) -> claimed 
    mapping(bytes32 => bool) public successfulClaim;
    // request id -> keccak256(abi.encodePacked(validationId, user account))
    mapping(bytes32 => bytes32) public validationRequest;

    /**
     * @notice Constructor inherits VRFConsumerBaseV2Plus
     *
     * @param subscriptionId - the subscription ID that this contract uses for funding requests
     * @param vrfCoordinator - coordinator, check https://docs.chain.link/vrf/v2-5/supported-networks
     * @param keyHash - the gas lane to use, which specifies the maximum gas price to bump to
     */
    constructor(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_keyHash = keyHash;
        s_subscriptionId = subscriptionId;
    }

    function setConfig(uint256 validationId, uint256 publicHash) public {
        // TODO
    }

    function getConfig(uint256 /* validationId */) external pure returns (string memory) {
        return string.concat("{}");
    }

    function validate(uint256 validationId, bytes calldata /* params */) public view override returns (bool) {
        bytes32 claimUID = keccak256(abi.encodePacked(validationId, msg.sender));
        bool result = successfulClaim[claimUID];
        return result;
    }

    /**
     * @notice Requests randomness
     * Assumes the subscription is funded sufficiently; "Words" refers to unit of data in Computer Science
     */
    function preValidation(uint256 validationId, bytes calldata /* preValidationParams */) external returns (bytes32) {
        // Will revert if subscription is not set and funded.
        s_requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        bytes32 claimUID = keccak256(abi.encodePacked(validationId, msg.sender));
        validationRequest[bytes32(s_requestId)] = claimUID;

        return claimUID;
    }

    /**
     * @notice Callback function used by VRF Coordinator
     *
     * @param _requestId - id of the request
     * @param randomWords - array of random results from VRF Coordinator
     */
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata randomWords
    ) internal override {
        bytes32 _requestIdb32 = bytes32(_requestId);
        s_randomWords = randomWords;
        
        if (randomWords[0] > randomWords[1]) {
            bytes32 _claim_uid = validationRequest[_requestIdb32];
            successfulClaim[_claim_uid] = true;
        }

        emit ReturnedRandomness(randomWords);
    }
}
