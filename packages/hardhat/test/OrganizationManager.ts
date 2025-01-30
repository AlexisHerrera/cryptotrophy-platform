import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersType } from "ethers";

import { OrganizationManager } from "../typechain-types";

describe("OrganizationManager", function () {
  // We define a fixture to reuse the same setup in every test.

  let contract: OrganizationManager;
  before(async () => {
    // const [owner] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("OrganizationManager");
    contract = (await yourContractFactory.deploy("CryptoTrophyPlatform", "CTP", 100)) as OrganizationManager;
    await contract.waitForDeployment();
  });

  describe("CryptoTrophy Token", function () {
    it("Should exist", async function () {
      expect(await contract.cryptoTrophyToken()).to.not.equal(ethersType.ZeroAddress);
    });
  });
});
