// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


import "hardhat/console.sol";
import {IFunctionsRouter} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/interfaces/IFunctionsRouter.sol";
import {IFunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/interfaces/IFunctionsClient.sol";


contract RouterMock {
  event RequestReceived(bytes32 requestId, address requester, string source, string[] args);

  uint256 private nonce;
  uint256 private lastRequestId;

  constructor() {
    lastRequestId = 0;
  }

  function sendRequest(
    uint64 /* subscriptionId */,
    bytes calldata /* data */,
    uint16 /* dataVersion */,
    uint32 /* callbackGasLimit */,
    bytes32 /* donId */
  ) public returns (bytes32 requestId) {
    lastRequestId += 1;
    return bytes32(lastRequestId);
  }

  function callFulfill(address originalContract, bytes32 _requestId, bool _completed) public {
    IFunctionsClient source = IFunctionsClient(originalContract);
    bytes memory _response = abi.encodePacked(bytes32(0));
    if (!_completed) {
      _response = abi.encodePacked(bytes32("0x1"));
    }
    bytes memory _err = "";
    source.handleOracleFulfillment(_requestId, _response, _err);
  }
}

