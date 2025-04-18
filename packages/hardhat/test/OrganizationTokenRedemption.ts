import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers as ethersHardhat } from "hardhat";
import { ethers } from "ethers";

import { OrganizationManager, OrganizationToken } from "../typechain-types";

describe("Organization Token Redemption", function () {
  async function deployOrgManagerFixture() {
    const [owner, user1, user2] = await ethersHardhat.getSigners();

    const OrgManagerFactory = await ethersHardhat.getContractFactory("OrganizationManager");
    const orgManager = (await OrgManagerFactory.deploy()) as OrganizationManager;
    await orgManager.waitForDeployment();

    return {
      orgManager,
      owner,
      user1,
      user2,
    };
  }

  async function deployOrganization(orgManager: OrganizationManager, initialSupply: number, initialEthBacking: bigint) {
    const tx = await orgManager.createOrganization(
      "TestOrg",
      "TST",
      initialSupply,
      initialEthBacking,
      [], // no extra admins
      { value: initialEthBacking },
    );

    const receipt = await tx.wait();
    const eventTopic = orgManager.interface.getEvent("OrganizationCreated");
    const log = receipt?.logs.find(l => l.topics[0] === eventTopic.topicHash);
    if (!log) throw new Error("Organization creation event not found");

    const decoded = orgManager.interface.decodeEventLog("OrganizationCreated", log.data, log.topics);
    const orgId = decoded.orgId;

    return orgId;
  }

  async function deployOrgWithEthBackingFixture() {
    const { orgManager, owner, user1, user2 } = await loadFixture(deployOrgManagerFixture);

    // Create organization with ETH backing
    const initialSupply = 1000;
    const initialEthBacking = ethers.parseEther("1"); // 1 ETH backing

    const orgId = await deployOrganization(orgManager, initialSupply, initialEthBacking);

    // Get the token contract
    const tokenAddress = await orgManager.getTokenOfOrg(orgId);
    const token = (await ethersHardhat.getContractAt("OrganizationToken", tokenAddress)) as OrganizationToken;

    // Transfer some tokens to user1 for testing
    await orgManager.transferTokensTo(orgId, user1.address, ethers.parseUnits("100", 18));

    return {
      orgManager,
      token,
      orgId,
      owner,
      user1,
      user2,
      initialSupply,
      initialEthBacking,
    };
  }

  async function deployOrgWithoutEthBackingFixture() {
    const { orgManager, owner, user1, user2 } = await loadFixture(deployOrgManagerFixture);

    // Create organization without ETH backing
    const initialSupply = 1000;
    const initialEthBacking = ethers.parseEther("0"); // 0 ETH backing

    const orgId = await deployOrganization(orgManager, initialSupply, initialEthBacking);

    // Get the token contract
    const tokenAddress = await orgManager.getTokenOfOrg(orgId);
    const token = (await ethersHardhat.getContractAt("OrganizationToken", tokenAddress)) as OrganizationToken;

    // Transfer some tokens to user1 for testing
    await orgManager.transferTokensTo(orgId, user1.address, ethers.parseUnits("100", 18));

    return {
      orgManager,
      token,
      orgId,
      owner,
      user1,
      user2,
    };
  }

  describe("Token Redemption", function () {
    it("Should calculate the correct exchange rate", async function () {
      const { token, initialSupply, initialEthBacking } = await loadFixture(deployOrgWithEthBackingFixture);

      const rate = await token.getCurrentExchangeRate();
      const expectedRate = ethers.parseUnits(initialSupply.toString(), 18) / initialEthBacking;

      expect(rate).to.equal(expectedRate);
    });

    it("Should allow users to redeem tokens for ETH", async function () {
      const { token, user1 } = await loadFixture(deployOrgWithEthBackingFixture);

      // Get initial balances
      const initialUserEthBalance = await ethersHardhat.provider.getBalance(user1.address);
      const initialUserTokenBalance = await token.balanceOf(user1.address);
      const initialContractEthBalance = await ethersHardhat.provider.getBalance(token.getAddress());

      const rate = await token.getCurrentExchangeRate();
      const redeemAmount = initialUserTokenBalance;
      const expectedEthAmount = redeemAmount / rate;

      const tx = await token.connect(user1).redeemTokensForEth(redeemAmount);
      const receipt = await tx.wait();

      // Calculate gas cost
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      // Get final balances
      const finalUserEthBalance = await ethersHardhat.provider.getBalance(user1.address);
      const finalUserTokenBalance = await token.balanceOf(user1.address);
      const finalContractEthBalance = await ethersHardhat.provider.getBalance(token.getAddress());

      // Verify token balance decreased
      expect(finalUserTokenBalance).to.equal(initialUserTokenBalance - redeemAmount);

      // Verify ETH was received (accounting for gas costs)
      expect(finalUserEthBalance).to.equal(initialUserEthBalance + expectedEthAmount - gasCost);

      // Verify contract's ETH balance decreased
      expect(finalContractEthBalance).to.equal(initialContractEthBalance - expectedEthAmount);
    });

    it("Should revert when trying to redeem more tokens than owned", async function () {
      const { token, user1 } = await loadFixture(deployOrgWithEthBackingFixture);
      expect(await token.redemptionEnabled()).to.equal(true);

      const userBalance = await token.balanceOf(user1.address);
      const tooMuch = userBalance + ethers.parseUnits("1", 18);

      await expect(token.connect(user1).redeemTokensForEth(tooMuch)).to.be.revertedWith("Insufficient token balance");
    });

    it("Should revert when trying to redeem with redemption disabled", async function () {
      const { token, user1 } = await loadFixture(deployOrgWithoutEthBackingFixture);

      expect(await token.redemptionEnabled()).to.equal(false);

      await expect(token.connect(user1).redeemTokensForEth(ethers.parseUnits("1", 18))).to.be.revertedWith(
        "Redemption not enabled",
      );
    });

    it("Should emit TokensRedeemed event with correct values", async function () {
      const { token, user1 } = await loadFixture(deployOrgWithEthBackingFixture);

      const initialUserTokenBalance = await token.balanceOf(user1.address);
      const redeemAmount = initialUserTokenBalance;
      const rate = await token.getCurrentExchangeRate();
      const expectedEthAmount = redeemAmount / rate;

      await expect(token.connect(user1).redeemTokensForEth(redeemAmount))
        .to.emit(token, "TokensRedeemed")
        .withArgs(user1.address, redeemAmount, expectedEthAmount);
    });

    it("Should handle complete token redemption correctly", async function () {
      const { token, user1, orgManager, orgId } = await loadFixture(deployOrgWithEthBackingFixture);

      // Transfer all remaining tokens to user1
      const orgBalance = await token.balanceOf(await orgManager.getAddress());
      await orgManager.transferTokensTo(orgId, user1.address, orgBalance);

      // Get initial balances
      const initialUserTokenBalance = await token.balanceOf(user1.address);
      const initialUserEthBalance = await ethersHardhat.provider.getBalance(user1.address);
      const initialContractEthBalance = await ethersHardhat.provider.getBalance(token.getAddress());

      const totalSupply = await token.totalSupply();
      expect(initialUserTokenBalance).to.equal(totalSupply);
      expect(initialContractEthBalance).to.be.gt(0);

      const rate = await token.getCurrentExchangeRate();
      const redeemAmount = initialUserTokenBalance;
      const expectedEthAmount = redeemAmount / rate;

      expect(expectedEthAmount).to.be.equal(initialContractEthBalance);

      // Redeem all tokens
      const tx = await token.connect(user1).redeemTokensForEth(initialUserTokenBalance);
      const receipt = await tx.wait();

      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      // Verify final state
      const finalUserEthBalance = await ethersHardhat.provider.getBalance(user1.address);
      const finalUserTokenBalance = await token.balanceOf(user1.address);
      const finalTotalSupply = await token.totalSupply();
      const finalContractEthBalance = await ethersHardhat.provider.getBalance(token.getAddress());

      // All tokens should be burned
      expect(finalUserTokenBalance).to.equal(0);
      expect(finalTotalSupply).to.equal(0);

      // Contract should have no ETH left
      expect(finalContractEthBalance).to.equal(0);

      // User should have received the expected ETH amount
      expect(finalUserEthBalance).to.equal(initialUserEthBalance + expectedEthAmount - gasCost);

      // Verify redemption is still enabled but should revert due to no supply/ETH
      expect(await token.redemptionEnabled()).to.equal(true);
    });
  });
});
