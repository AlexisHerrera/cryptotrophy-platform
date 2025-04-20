// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./TwoStepValidator.sol";
import "../../Challenges/IValidator.sol";


struct OffChainApiConfig {
    bool exists;
    string apiUrl;
    string dataPath;
    address callback;
}


contract OffChainApiValidator is TwoStepValidator, FunctionsClient, ConfirmedOwner  {
    using FunctionsRequest for FunctionsRequest.Request;

    error UnexpectedRequestID(bytes32 requestId);

    // Chainlink variables
    address public router;
    bytes32 public donId;
    uint64 public subscriptionId;
    string public source;
    uint32 public constant MAX_CALLBACK_GAS = 70_000;

    // validationId -> validatorConfig
    mapping(uint256 => OffChainApiConfig) public config;

    bytes32 validatorUID;

    event OffChainApiValidatorCalled(uint256 validationId, address indexed claimer, bytes32 indexed requestId);
    event OffChainApiValidatorFulfilled(bytes32 indexed requestId, bytes32 response);
    event OffChainApiValidatorError(bytes32 indexed requestId, bytes errorData);

    constructor(
        address _router
        , bytes32 _donId
        , string memory _source
        , uint64 _subscriptionId
        , bytes32 _validatorUID
    ) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
        router = _router;
        donId = _donId;
        source = _source;
        subscriptionId = _subscriptionId;
        validatorUID = _validatorUID;
    }

    function setConfig(uint256 _validationId, string calldata _apiUrl, string calldata _dataPath, address _callback) public {
        config[_validationId] = OffChainApiConfig(true, _apiUrl, _dataPath, _callback);
    }

    function getConfig(uint256 _validationId) external view returns (string memory) {
        OffChainApiConfig storage _validatorConfig = config[_validationId];
		require(_validatorConfig.exists, "Error. Invalid configuration. No API configured for validationId.");
        return string(abi.encodePacked('{"apiUrl":"', _validatorConfig.apiUrl, '"}'));
    }

    function preValidation(uint256 _validationId, bytes calldata /* preValidationParams */) external returns (bytes32) {
        OffChainApiConfig storage _validatorConfir = config[_validationId];
		require(_validatorConfir.exists, "Error. Invalid configuration. No API configured for validationId.");

        // Specify the url to call
        string memory url = string(
            abi.encodePacked(
                _validatorConfir.apiUrl,
                Strings.toString(_validationId),
                "/",
                Strings.toString(uint256(keccak256(abi.encodePacked(msg.sender))))
            )
        );
        string[] memory args = new string[](2);
        args[0] = url;
        args[1] = _validatorConfir.dataPath;

        // Sends the request
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            MAX_CALLBACK_GAS,
            donId
        );
        console.log(uint256(requestId));

        // Store the request to trace the fulfill
        bytes32 _claimUID = keccak256(abi.encodePacked(_validationId, msg.sender));
        validationRequest[requestId] = _claimUID;
        claims[_claimUID] = Claim(_validationId, msg.sender, ValidationState.PREVALIDATION);

        emit OffChainApiValidatorCalled(_validationId, msg.sender, requestId);

        return requestId;
    }

    // Callback function. 
    // NOTE: This function is protected by FunctionsClient.
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        bytes32 _claimUID = validationRequest[requestId];
        require(_claimUID != bytes32(0), "Invalid request ID");
        Claim storage _claim = claims[_claimUID];

        console.log("fulfillRequest validationId", _claim.validationId);
        console.log("fulfillRequest state", err.length);

        if (err.length > 0) {
            // Log the error
            emit OffChainApiValidatorError(requestId, err);
            console.log("Error");

            // Handle error case
            _claim.state = ValidationState.FAIL;
        } else {
            bytes32 _response = bytes32(response);
            emit OffChainApiValidatorFulfilled(requestId, _response);
            console.log("No error");

            if (_response == bytes32(0)) {
                console.log("SUCCESS");
                _claim.state = ValidationState.SUCCESS;
                // Optional: Log the response
                OffChainApiConfig storage _validatorConfig = config[_claim.validationId];
                if (_validatorConfig.callback != address(0)) {
                    IValidatorCallback _callbackContract = IValidatorCallback(_validatorConfig.callback);
                    _callbackContract.validatorClaimCallback(validatorUID, _claim.validationId, _claim.claimer);
                }
            } else {
                console.log("FAIL");
                _claim.state = ValidationState.FAIL;
            }
        }
    }
}
