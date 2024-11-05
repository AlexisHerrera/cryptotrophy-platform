// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";


contract MarathonTrophyV1 is ChainlinkClient, ConfirmedOwner  {
    using Chainlink for Chainlink.Request;

   // Chainlink variables
    address public oracle;
    bytes32 public jobId;
    address public link;
    uint256 private fee;

    uint256 public executed;
    bytes32 public lastRequestId;
    string public lastUrl;
    bool public lastCompleted;
    address public withdrawTo;
    uint256 public rewardAmount = 1 * 10 ** 18 / 1000; // Reward amount in tokens

    mapping(address => bool) public hasClaimed;
    mapping(bytes32 => address payable) public requestAddress;

    constructor(address _oracle, address _link) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_link);
        _setChainlinkOracle(_oracle);
        oracle = _oracle;
        jobId = "c1c5e92880894eb6b27d3cae19670aa3";
        link = _link;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
        withdrawTo = msg.sender;
        executed = 0;
    }

    // Function to request marathon completion status
    function claimReward(uint256 marathonId) public returns (bytes32 requestId) {
        require(!hasClaimed[msg.sender], "Reward already claimed");

        Chainlink.Request memory request = _buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        ); 

        // Set the URL to perform the GET request on
        // string memory url = "https://zvjpgaj7wwqwe2hqmj3oix5f3i0dpjmr.lambda-url.us-east-2.on.aws/";
        string memory url = string(
            abi.encodePacked(
                "https://zvjpgaj7wwqwe2hqmj3oix5f3i0dpjmr.lambda-url.us-east-2.on.aws/marathon/",
                Strings.toString(marathonId),
                "/1234"
            )
        );
        request._add("get", url);
        lastUrl=url;

        // Specify the path to find the desired data in the API response
        request._add("path", "finished");

        // Sends the request
        requestId = _sendChainlinkRequest(request, fee);
        //requestId = jobId;

        requestAddress[requestId] = payable(msg.sender);
        lastRequestId = requestId;

        return requestId;
    }

    // Callback function
    function fulfill(
        bytes32 _requestId,
        bool _completed
    ) public recordChainlinkFulfillment(_requestId) {
        lastCompleted=_completed;
        executed += 1;
        if (_completed) {
            hasClaimed[requestAddress[_requestId]] = true;
            // Transfer tokens or implement your token distribution logic here
            // For example, calling an ERC20 token's transfer function
            (bool success,) = requestAddress[_requestId].call{value: rewardAmount}("");
            require(success, "Failed to send Ether");

        } else {
            revert("Marathon not completed");
        }
    }

    function deposit() public payable {}

    function withdraw() public {
        // get the amount of Ether stored in this contract
        uint256 amount = address(this).balance;

        // send all Ether to owner
        (bool success,) = withdrawTo.call{value: amount}("");
        require(success, "Failed to send Ether");
    }
}
