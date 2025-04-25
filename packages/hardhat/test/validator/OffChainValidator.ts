import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers as ethersHardhat } from "hardhat";

describe("OffChainValidator contract", function () {
  async function deployOffChainValidatorFixture() {
    const [owner, admin1, user1, user2, outsider] = await ethersHardhat.getSigners();

    const mocklink = await hre.ethers.deployContract("MockLinkToken");
    const mocklinkAddr = await mocklink.getAddress();

    const oracleMock = await hre.ethers.deployContract("OracleMock");
    const oracleMockAddr = await oracleMock.getAddress();

    const offChainValidator = await hre.ethers.deployContract("OffChainValidator", [oracleMockAddr, mocklinkAddr]);

    // Provide LINK token to contract
    const offChainValidatorAddr = await offChainValidator.getAddress();
    await mocklink.setBalance(offChainValidatorAddr, 10n ** 21n);

    return {
      owner,
      admin1,
      user1,
      user2,
      outsider,
      mocklink,
      oracleMock,
      offChainValidator,
    };
  }

  describe("simulatedOffChainCall", function () {
    it("Should validate when offChain API returns true", async function () {
      const { owner, offChainValidator, oracleMock } = await loadFixture(deployOffChainValidatorFixture);

      // Initiate offchain validation
      const dummyChallengeId = 134;

      // Configure validator apiUrl and field path for dummy challenge
      const setconfig = await offChainValidator.setConfig(
        dummyChallengeId,
        "https://example.com/endpoint",
        "/path/to/bool/attribute",
      );
      await setconfig.wait();

      // Request validation
      const preval = await offChainValidator.preValidation(dummyChallengeId, "0x");
      await preval.wait();

      const offChainValidatorAddr = await offChainValidator.getAddress();
      // The requestId is initialized in ChainlinkClient
      const requestId = ethersHardhat.keccak256(
        ethersHardhat.solidityPacked(["address", "uint256"], [offChainValidatorAddr, 1]),
      );

      // Simulate response
      const fulfill = await oracleMock.callFulfill(offChainValidatorAddr, requestId, true);
      await fulfill.wait();

      // Test Validation
      const abiCoder = new ethersHardhat.AbiCoder();
      const params = abiCoder.encode(["address[1]"], [[owner.address]]);
      expect(await offChainValidator.validate(dummyChallengeId, params)).to.equal(true);
    });
  });
});
