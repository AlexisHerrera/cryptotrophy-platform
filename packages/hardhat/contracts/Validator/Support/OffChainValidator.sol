// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./TwoStepValidator.sol";


struct OffChainApiConfig {
    bool exists;
    string apiUrl;
    string dataPath;
}


contract OffChainValidator is TwoStepValidator, ChainlinkClient, ConfirmedOwner  {
    using Chainlink for Chainlink.Request;

    // Chainlink variables
    address public oracle;
    bytes32 public jobId;
    address public link;
    uint256 private fee;

    // validationId -> validatorConfig
    mapping(uint256 => OffChainApiConfig) public config;

    // Debug info
    uint256 public lastExecuted;
    string public lastUrl;
    bool public lastCompleted;


    constructor(address _oracle, address _link) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_link);
        _setChainlinkOracle(_oracle);
        oracle = _oracle;
        jobId = "c1c5e92880894eb6b27d3cae19670aa3";
        link = _link;
        fee = (1 * LINK_DIVISIBILITY) / 10;
        lastExecuted = 0;
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

        Chainlink.Request memory request = _buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        ); 

        // Specify the url to call
        string memory url = string(
            abi.encodePacked(
                paramsStruct.apiUrl,
                Strings.toString(validationId)
            )
        );
        request._add("get", url);

        // Specify the path to find the desired data in the API response
        request._add("path", paramsStruct.dataPath);

        // Sends the request
        bytes32 requestId = _sendChainlinkRequest(request, fee);

        bytes32 claimUID = keccak256(abi.encodePacked(validationId, msg.sender));
        validationRequest[requestId] = claimUID;
        claimState[claimUID] = ValidationState.PREVALIDATION;

        // DEBUG
        lastUrl=url;
        lastRequestId = requestId;

        return requestId;
    }

    // Callback function
    function fulfill(
        bytes32 _requestId,
        bool _completed
    ) public recordChainlinkFulfillment(_requestId) {
        lastCompleted=_completed;
        lastExecuted += 1;
        if (_completed) {
            claimState[validationRequest[_requestId]] = ValidationState.SUCCESS;
        } else {
            claimState[validationRequest[_requestId]] = ValidationState.FAIL;
        }
    }
}
