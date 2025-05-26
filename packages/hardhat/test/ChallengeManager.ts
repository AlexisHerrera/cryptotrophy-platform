import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers as ethersHardhat } from "hardhat";
import { ethers } from "ethers";
import { OrganizationManager, ChallengeManager, OrganizationToken } from "../typechain-types";

describe("ChallengeManager (with real OrganizationManager)", function () {
  async function deployCoreContractsFixture() {
    const [owner, admin1, admin2, user1, user2, notAdmin] = await ethersHardhat.getSigners();

    const OrgFactory = await ethersHardhat.getContractFactory("OrganizationManager");
    const orgManager = (await OrgFactory.deploy()) as OrganizationManager;
    await orgManager.waitForDeployment();

    const ChallFactory = await ethersHardhat.getContractFactory("ChallengeManager");
    const challengeManager = (await ChallFactory.deploy(await orgManager.getAddress())) as ChallengeManager;
    await challengeManager.waitForDeployment();

    return { orgManager, challengeManager, owner, admin1, admin2, user1, user2, notAdmin };
  }

  describe("tokensAvailable & fundOrganization", function () {
    async function createOrgFixture() {
      const { orgManager, challengeManager, owner, admin1, notAdmin } = await loadFixture(deployCoreContractsFixture);

      const tx = await orgManager.createOrganization(
        "TestOrg",
        "TOK",
        1000,
        ethers.parseEther("1"),
        [owner.address, admin1.address],
        "http://localhost",
        { value: ethers.parseEther("1") },
      );
      const receipt = await tx.wait();

      // extraemos orgId del log
      const eventTopic = orgManager.interface.getEvent("OrganizationCreated");
      const log = receipt?.logs.find(l => l.topics[0] === eventTopic.topicHash);
      if (!log) throw new Error("OrganizationCreated event not found");
      const decoded = orgManager.interface.decodeEventLog("OrganizationCreated", log.data, log.topics);
      const orgId: number = decoded.orgId;

      return { orgManager, challengeManager, owner, admin1, notAdmin, orgId };
    }

    it("Should return full token balance initially", async function () {
      const { orgManager, challengeManager, orgId } = await loadFixture(createOrgFixture);
      const tokenAddr = await orgManager.getTokenOfOrg(orgId);
      const token = (await ethersHardhat.getContractAt("OrganizationToken", tokenAddr)) as OrganizationToken;

      const managerAddr = await orgManager.getAddress();
      const initial = await token.balanceOf(managerAddr);
      const available = await challengeManager.tokensAvailable(orgId);

      expect(available).to.equal(initial);
    });

    it("mintOrganizationToken by admin should increase tokensAvailable", async function () {
      const { orgManager, challengeManager, owner, orgId } = await loadFixture(createOrgFixture);
      const tokenAddr = await orgManager.getTokenOfOrg(orgId);
      const token = (await ethersHardhat.getContractAt("OrganizationToken", tokenAddr)) as OrganizationToken;

      const managerAddr = await orgManager.getAddress();
      const initial = await token.balanceOf(managerAddr);

      const mintAmount = ethers.parseEther("100");
      await (await orgManager.connect(owner).mintOrganizationToken(orgId, mintAmount)).wait();

      const available = await challengeManager.tokensAvailable(orgId);
      expect(available).to.equal(initial + mintAmount);
    });

    it("fundOrganization by admin should NOT change tokensAvailable", async function () {
      const { orgManager, challengeManager, owner, orgId } = await loadFixture(createOrgFixture);
      const tokenAddr = await orgManager.getTokenOfOrg(orgId);
      const token = (await ethersHardhat.getContractAt("OrganizationToken", tokenAddr)) as OrganizationToken;

      const managerAddr = await orgManager.getAddress();
      const initial = await token.balanceOf(managerAddr);

      const fundingAmount = ethers.parseEther("2");
      await (await orgManager.connect(owner).fundOrganization(orgId, { value: fundingAmount })).wait();

      const available = await challengeManager.tokensAvailable(orgId);
      expect(available).to.equal(initial);
    });

    it("fundOrganization by admin should forward ETH to token contract", async function () {
      const { orgManager, owner, orgId } = await loadFixture(createOrgFixture);
      const tokenAddr = await orgManager.getTokenOfOrg(orgId);
      const fundingAmount = ethers.parseEther("2");

      await expect(() =>
        orgManager.connect(owner).fundOrganization(orgId, { value: fundingAmount }),
      ).to.changeEtherBalance(tokenAddr, fundingAmount);
    });

    it("mintOrganizationToken should revert when called by non-admin", async function () {
      const { orgManager, notAdmin, orgId } = await loadFixture(createOrgFixture);
      await expect(
        orgManager.connect(notAdmin).mintOrganizationToken(orgId, ethers.parseEther("1")),
      ).to.be.revertedWith("Not an admin");
    });

    it("fundOrganization should revert when called by non-admin", async function () {
      const { orgManager, notAdmin, orgId } = await loadFixture(createOrgFixture);
      await expect(
        orgManager.connect(notAdmin).fundOrganization(orgId, { value: ethers.parseEther("1") }),
      ).to.be.revertedWith("Not an admin");
    });
  });
});
