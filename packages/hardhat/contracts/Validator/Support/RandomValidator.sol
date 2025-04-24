// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "./TwoStepValidator.sol";


struct RandomValidatorConfig {
    bool exists;
    // Set the probability in basis points (1% = 100; 0.01% = 1)
    uint256 successProbability;
    address callback;
}


contract RandomValidator is TwoStepValidator, VRFConsumerBaseV2Plus {
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
    uint32 constant CALLBACK_GAS_LIMIT = 200000;

    // The default is 3, but you can set this higher.
    uint16 constant REQUEST_CONFIRMATIONS = 3;

    // For this example, retrieve 1 random values in one request.
    // Cannot exceed VRFCoordinatorV2_5.MAX_NUM_WORDS.
    uint32 constant NUM_WORDS = 1;

    // validationId -> validatorConfig
    mapping(uint256 => RandomValidatorConfig) public configs;

    bytes32 validatorUID;

    event RandomValidatorCalled(uint256 validationId, address indexed claimer, bytes32 indexed requestId);

    /**
     * @notice Constructor inherits VRFConsumerBaseV2Plus
     *
     * @param _subscriptionId - the subscription ID that this contract uses for funding requests
     * @param _vrfCoordinator - coordinator, check https://docs.chain.link/vrf/v2-5/supported-networks
     * @param _keyHash - the gas lane to use, which specifies the maximum gas price to bump to
     * @param _validatorUID - Unique identifier for this validator
     */
    constructor(
        uint256 _subscriptionId
        , address _vrfCoordinator
        , bytes32 _keyHash
        , bytes32 _validatorUID
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        s_keyHash = _keyHash;
        s_subscriptionId = _subscriptionId;
        validatorUID = _validatorUID;
    }

	function setConfigFromParams(uint256 _validationId, bytes calldata _params) public {
        console.log("EEEEEEEEEEEE");
		( uint256 _successProbability, address _callback ) = abi.decode(_params, (uint256, address));
        require(_successProbability <= 10000, "Probability must be <= 10000 (100%)");
        configs[_validationId] = RandomValidatorConfig(true, _successProbability, _callback);
	}

    function setConfig(uint256 _validationId, uint256 _successProbability, address _callback) public {
        require(_successProbability <= 10000, "Probability must be <= 10000 (100%)");
        configs[_validationId] = RandomValidatorConfig(true, _successProbability, _callback);
    }

    function getConfig(uint256 _validationId) external view returns (string memory) {
        RandomValidatorConfig storage _validatorConfig = configs[_validationId];
		require(_validatorConfig.exists, "Error. Invalid configuration. Nothing configured for validationId.");
        return string(abi.encodePacked('{"successProbability":"', _validatorConfig.successProbability, '"}'));
    }

    /**
     * @notice Requests randomness
     * Assumes the subscription is funded sufficiently; "Words" refers to unit of data in Computer Science
     */
    function preValidation(uint256 _validationId, bytes calldata /* preValidationParams */) external returns (bytes32) {
        // Will revert if subscription is not set and funded.
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
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

        bytes32 claimUID = keccak256(abi.encodePacked(_validationId, msg.sender));
        validationRequest[bytes32(requestId)] = claimUID;
        claims[claimUID] = Claim(_validationId, msg.sender, ValidationState.PREVALIDATION);

        emit RandomValidatorCalled(_validationId, msg.sender, bytes32(requestId));

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
        bytes32 _claimUID = validationRequest[bytes32(_requestId)];
        require(_claimUID != bytes32(0), "Invalid request ID");
        Claim storage _claim = claims[_claimUID];
        
        RandomValidatorConfig storage _validatorConfig = configs[_claim.validationId];

        if (randomWords[0] % 10_000 < _validatorConfig.successProbability) {
            _claim.state = ValidationState.SUCCESS;
            if (_validatorConfig.callback != address(0)) {
                IValidatorCallback _callbackContract = IValidatorCallback(_validatorConfig.callback);
                _callbackContract.validatorClaimCallback(validatorUID, _claim.validationId, _claim.claimer);
            }
        } else {
            _claim.state = ValidationState.FAIL;
        }
    }
}
