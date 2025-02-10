import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers as ethersHardhat } from "hardhat";

describe("OnChainValidator contract", function () {
  async function deployOnChainValidatorFixture() {
    const [owner, admin1, user1, user2, outsider] = await ethersHardhat.getSigners();
    const groth16 = await hre.ethers.deployContract("Groth16Verifier");
    const groth16Addr = await groth16.getAddress();

    const onChainValidator = await hre.ethers.deployContract("OnChainValidator", [groth16Addr]);

    return {
      owner,
      admin1,
      user1,
      user2,
      outsider,
      onChainValidator,
    };
  }

  describe("simulatedOnChainCall", function () {
    it("Should validate when passed parameters are correct", async function () {
      const { onChainValidator } = await loadFixture(deployOnChainValidatorFixture);

      // Initiate offchain validation
      const dummyChallengeId = 134;

      const pA = [
        BigInt("0x11330e63bf9b3dfebc13a43aeecd02e7fbfd27bb28c92cd1af56ce46fa46a440"),
        BigInt("0x0591cf82d4fee26fe3ad3db30a8b6fb4a7b16c6882b1abc3fd594c60c3539d62"),
      ];
      const pB = [
        [
          BigInt("0x2461d78ea22ad59a5a2c3561612529aaa8530df9cd994a0949e19adcd237f242"),
          BigInt("0x2a2ffa2967b118b25202dd3e134f2781d4ad4232760d229806f1b05af570422f"),
        ],
        [
          BigInt("0x13a29ca698361d95fd14d375f3e2fba4a2334ba0b0fb3335082c09df9ca9e8e9"),
          BigInt("0x2265b4f4f13414edb423e6cbdee544ad976b2d92a16ab0672d96d6905e4edfaa"),
        ],
      ];
      const pC = [
        BigInt("0x070f8cf88ea82beb79ec573dc69911644d3acb922984cafa29ae8234edda042e"),
        BigInt("0x0837935e808e34c4d40b8d2d81078b85a712a6557eb0fba8cb42df5f89791cfa"),
      ];

      // Configure validator apiUrl and field path for dummy challenge
      const publicHash = BigInt("0x27be7bee4249f4ca283b260d6888168532746c8312c1167104664c8ff1fa5167");
      await onChainValidator.setConfig(dummyChallengeId, publicHash);

      // Create an ABI coder instance
      const abiCoder = new ethers.AbiCoder();

      // Encode the parameters into bytes
      const params = abiCoder.encode(["uint256[2]", "uint256[2][2]", "uint256[2]"], [pA, pB, pC]);

      // Test Validation
      expect(await onChainValidator.validate(dummyChallengeId, params)).to.equal(true);
    });
  });
});
