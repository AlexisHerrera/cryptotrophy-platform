// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


interface ICallerContract {
    function fulfill(bytes32 _requestId, bool _completed) external;
}


contract OracleMock {
  function onTokenTransfer(address sender, uint256 amount, bytes calldata data) external {}

  function callFulfill(address originalContract, bytes32 _requestId, bool _completed) public {
    ICallerContract source = ICallerContract(originalContract);
    source.fulfill(_requestId, _completed);
  }
}

