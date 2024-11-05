// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RewardSystem {
    struct Campaign {
        string name;
        address owner;
        uint ethPerClaim; // Amount in wei
        bytes32 secretHash; // Almacena el hash del número secreto
        uint totalFund;
        bool exists; // Indica si la campaña existe
        mapping(address => bool) hasClaimed;
    }

    mapping(uint => Campaign) private campaigns;
    uint[] private campaignIds;
    uint private nextCampaignId = 1;

    // Evento emitido cuando se crea una recompensa
    event RewardCreated(
        uint campaignId,
        string name,
        address owner,
        uint ethPerClaim,
        uint totalFund
    );

    // Evento emitido cuando se reclama una recompensa
    event RewardClaimed(uint campaignId, address claimer, uint amount);

    // Crear una nueva campaña de recompensas
    function createReward(
        string memory name,
        uint ethPerClaimInWei,
        bytes32 secretHash
    ) public payable {
        require(msg.value > 0, "Must fund campaign with ETH");
        require(ethPerClaimInWei > 0, "ETH per claim must be greater than zero");

        uint campaignId = nextCampaignId++;
        Campaign storage campaign = campaigns[campaignId];

        campaign.exists = true;
        campaign.owner = msg.sender;
        campaign.name = name;
        campaign.ethPerClaim = ethPerClaimInWei;
        campaign.secretHash = secretHash;
        campaign.totalFund = msg.value;

        campaignIds.push(campaignId);

        emit RewardCreated(
            campaignId,
            name,
            msg.sender,
            ethPerClaimInWei,
            msg.value
        );
    }

    // Reclamar una recompensa para una campaña específica
    function claimReward(uint campaignId, string memory secret) public {
        Campaign storage campaign = campaigns[campaignId];

        require(campaign.exists, "Campaign does not exist");
        require(
            campaign.secretHash == keccak256(abi.encodePacked(secret)),
            "Incorrect secret"
        );
        require(!campaign.hasClaimed[msg.sender], "Reward already claimed");
        require(
            campaign.totalFund >= campaign.ethPerClaim,
            "Insufficient campaign funds"
        );

        // Actualizar estado antes de transferir
        campaign.hasClaimed[msg.sender] = true;
        campaign.totalFund -= campaign.ethPerClaim;

        payable(msg.sender).transfer(campaign.ethPerClaim);

        emit RewardClaimed(campaignId, msg.sender, campaign.ethPerClaim);
    }

    // Solo el propietario de la campaña puede retirar los fondos restantes
    function withdrawCampaignFunds(uint campaignId) public {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "Campaign does not exist");
        require(
            msg.sender == campaign.owner,
            "Only the campaign owner can withdraw funds"
        );

        uint remainingFunds = campaign.totalFund;
        require(remainingFunds > 0, "No funds to withdraw");

        // Actualizar estado antes de transferir
        campaign.totalFund = 0;

        payable(msg.sender).transfer(remainingFunds);
    }

    // Listar todas las campañas con detalles básicos
    function getAllCampaignDetails() public view returns (
        uint[] memory,
        string[] memory,
        uint[] memory,
        uint[] memory
    ) {
        uint[] memory ids = new uint[](campaignIds.length);
        string[] memory names = new string[](campaignIds.length);
        uint[] memory ethPerClaims = new uint[](campaignIds.length);
        uint[] memory totalFunds = new uint[](campaignIds.length);

        for (uint i = 0; i < campaignIds.length; i++) {
            uint id = campaignIds[i];
            Campaign storage campaign = campaigns[id];
            ids[i] = id;
            names[i] = campaign.name;
            ethPerClaims[i] = campaign.ethPerClaim;
            totalFunds[i] = campaign.totalFund;
        }

        return (ids, names, ethPerClaims, totalFunds);
    }
}
