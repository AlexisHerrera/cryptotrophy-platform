// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RewardSystem {
    struct Campaign {
        address owner;
        uint ethPerClaim; // Amount in wei
        uint secretNumber;
        uint totalFund;
        mapping(address => bool) hasClaimed;
    }

    mapping(string => Campaign) public campaigns;

    // Event emitted when a reward is created
    event RewardCreated(
        string campaignName,
        address owner,
        uint ethPerClaim,
        uint secretNumber,
        uint totalFund
    );

    // Event emitted when a reward is claimed
    event RewardClaimed(string campaignName, address claimer, uint amount);

    // Create a new reward campaign
    function createReward(
        string memory campaignName,
        uint ethPerClaimInWei,
        uint secretNumber
    ) public payable {
        require(msg.value > 0, "Must fund campaign with ETH");
        require(
            ethPerClaimInWei > 0,
            "ETH per claim must be greater than zero"
        );

        Campaign storage campaign = campaigns[campaignName];
        require(campaign.totalFund == 0, "Campaign already exists");

        campaign.owner = msg.sender;
        campaign.ethPerClaim = ethPerClaimInWei;
        campaign.secretNumber = secretNumber;
        campaign.totalFund = msg.value;

        emit RewardCreated(
            campaignName,
            msg.sender,
            ethPerClaimInWei,
            secretNumber,
            msg.value
        );
    }

    // Claim a reward for a specific campaign
    function claimReward(string memory campaignName, uint secretNumber) public {
        Campaign storage campaign = campaigns[campaignName];

        require(campaign.totalFund > 0, "Campaign does not exist");
        require(
            campaign.secretNumber == secretNumber,
            "Incorrect secret number"
        );
        require(!campaign.hasClaimed[msg.sender], "Reward already claimed");

        require(
            campaign.totalFund >= campaign.ethPerClaim,
            "Insufficient campaign funds"
        );

        campaign.hasClaimed[msg.sender] = true;
        campaign.totalFund -= campaign.ethPerClaim;

        payable(msg.sender).transfer(campaign.ethPerClaim);

        emit RewardClaimed(campaignName, msg.sender, campaign.ethPerClaim);
    }

    // Only the campaign owner can withdraw remaining funds
    function withdrawCampaignFunds(string memory campaignName) public {
        Campaign storage campaign = campaigns[campaignName];
        require(
            msg.sender == campaign.owner,
            "Only the campaign owner can withdraw funds"
        );

        uint remainingFunds = campaign.totalFund;
        require(remainingFunds > 0, "No funds to withdraw");

        campaign.totalFund = 0;
        payable(msg.sender).transfer(remainingFunds);
    }
}