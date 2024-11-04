// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";


contract MarathonReward is ChainlinkClient, ConfirmedOwner  {
    using Chainlink for Chainlink.Request;

   // Chainlink variables
    address public oracle;
    bytes32 public jobId;
    address public link;
    uint256 private fee;

    string public lastUrl;
    bool public lastCompleted;
    address public withdrawTo;
    uint256 public rewardAmount = 1 * 10 ** 18 / 10000; // Reward amount in tokens

    mapping(address => bool) public hasClaimed;
    mapping(bytes32 => address payable) public requestAddress;

    // Events
    event RequestMarathonStatus(bytes32 indexed requestId, address indexed user);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _oracle, address _link) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_link);
        _setChainlinkOracle(_oracle);
        oracle = _oracle;
        jobId = "ca98366cc7314957b8c012c72f05aeeb";
        link = _link;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
        withdrawTo = msg.sender;
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
                "https://jsonplaceholder.typicode.com/todos/",
                Strings.toString(marathonId)
            )
        );
        request._add("get", url);
        lastUrl=url;

        // Specify the path to find the desired data in the API response
        request._add("path", "completed");

        // Sends the request
        requestId = _sendChainlinkRequestTo(oracle, request, fee);
        //requestId = jobId;

        requestAddress[requestId] = payable(msg.sender);

        emit RequestMarathonStatus(requestId, msg.sender);
    }

    // Callback function
    function fulfill(bytes32 _requestId, bool _completed) public recordChainlinkFulfillment(_requestId) {
        lastCompleted=_completed;
        if (_completed) {
            hasClaimed[msg.sender] = true;
            // Transfer tokens or implement your token distribution logic here
            // For example, calling an ERC20 token's transfer function
            requestAddress[_requestId].transfer(rewardAmount);
            emit RewardClaimed(msg.sender, rewardAmount);
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
