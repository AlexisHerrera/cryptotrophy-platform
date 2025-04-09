// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./TwoStepValidator.sol";


struct OffChainApiConfig {
    bool exists;
    string apiUrl;
    string dataPath;
}


contract OffChainApiValidator is TwoStepValidator, FunctionsClient, ConfirmedOwner  {
    using FunctionsRequest for FunctionsRequest.Request;

    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);

    // Chainlink variables
    address public router;
    bytes32 public donId;
    uint64 public subscriptionId;
    string public source;
    uint32 public constant MAX_CALLBACK_GAS = 70_000;

    // validationId -> validatorConfig
    mapping(uint256 => OffChainApiConfig) public config;

    // Debug info
    uint256 public lastExecuted;
    string public lastUrl;
    bool public lastCompleted;

    constructor(address _router, bytes32 _donId, string memory _source, uint64 _subscriptionId) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
        router = _router;
        donId = _donId;
        source = _source;
        lastExecuted = 0;
        subscriptionId = _subscriptionId;
    }

    function setConfig(uint256 validationId, string calldata apiUrl, string calldata dataPath) public {
        config[validationId] = OffChainApiConfig(true, apiUrl, dataPath);
    }

    function getConfig(uint256 validationId) external view returns (string memory) {
        OffChainApiConfig memory paramsStruct = config[validationId];
		require(paramsStruct.exists, "Error. Invalid configuration. No API configured for validationId.");
        return string.concat("{\"apiUrl\": \"", paramsStruct.apiUrl, "\"}");
    }

    function preValidation(uint256 validationId, bytes calldata /* preValidationParams */) external returns (bytes32) {
        OffChainApiConfig memory paramsStruct = config[validationId];
		require(paramsStruct.exists, "Error. Invalid configuration. No API configured for validationId.");

        // Specify the url to call
        string memory url = string(
            abi.encodePacked(
                paramsStruct.apiUrl,
                Strings.toString(validationId),
                "/",
                Strings.toString(uint256(keccak256(abi.encodePacked(msg.sender))))
            )
        );
        string[] memory args = new string[](2);
        args[0] = url;
        args[1] = paramsStruct.dataPath;

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
        bytes32 claimUID = keccak256(abi.encodePacked(validationId, msg.sender));
        validationRequest[requestId] = claimUID;
        claimState[claimUID] = ValidationState.PREVALIDATION;

        // DEBUG
        lastUrl=url;
        lastRequestId = requestId;

        return requestId;
    }

    // Callback function
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        bytes32 _response = bytes32(response);
        // TODO HANDLE ERRORS
        lastCompleted = _response == bytes32(0);
        lastExecuted += 1;
        if (_response == bytes32(0)) {
            claimState[validationRequest[requestId]] = ValidationState.SUCCESS;
        } else {
            claimState[validationRequest[requestId]] = ValidationState.FAIL;
        }
    }
}
