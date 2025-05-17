import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers as ethersHardhat } from "hardhat";

describe("SecretValidator contract", function () {
  async function deploySecretValidatorFixture() {
    const [owner, user1, user2] = await ethersHardhat.getSigners();

    // Deploy the Groth16Verifier first
    const groth16Verifier = await hre.ethers.deployContract("Groth16Verifier");
    const groth16VerifierAddr = await groth16Verifier.getAddress();

    // Deploy SecretValidator with Groth16Verifier address
    const secretValidator = await hre.ethers.deployContract("SecretValidator", [groth16VerifierAddr]);

    return {
      owner,
      user1,
      user2,
      groth16Verifier,
      secretValidator,
    };
  }

  describe("Configuration", function () {
    it("Should set and verify configuration with direct hash array", async function () {
      const { secretValidator } = await loadFixture(deploySecretValidatorFixture);

      const validationId = 1;
      const hashes = [1234n, 5678n]; // Sample hashes

      await secretValidator.setConfig(validationId, hashes);

      // Verify the hashes are properly set
      expect(await secretValidator.config(validationId, hashes[0])).to.equal(true);
      expect(await secretValidator.config(validationId, hashes[1])).to.equal(true);
      expect(await secretValidator.config(validationId, 9999n)).to.equal(false); // Non-configured hash
    });

    it("Should set configuration from encoded parameters", async function () {
      const { secretValidator } = await loadFixture(deploySecretValidatorFixture);

      const validationId = 2;
      const hashes = [7890n, 12345n];

      const abiCoder = new ethersHardhat.AbiCoder();
      const params = abiCoder.encode(["uint256", "uint256[]"], [hashes.length, hashes]);

      await secretValidator.setConfigFromParams(validationId, params);

      // Verify the hashes are properly set
      expect(await secretValidator.config(validationId, hashes[0])).to.equal(true);
      expect(await secretValidator.config(validationId, hashes[1])).to.equal(true);
    });

    it("Should get configuration string representation", async function () {
      const { secretValidator } = await loadFixture(deploySecretValidatorFixture);

      const validationId = 3;
      expect(await secretValidator.getConfig(validationId)).to.equal("3");
    });
  });

  describe("Validation", function () {
    it("Should track used hashes", async function () {
      // Deploy mock verifier first
      const mockVerifier = await hre.ethers.deployContract("MockGroth16Verifier");
      const mockVerifierAddr = await mockVerifier.getAddress();

      // Deploy SecretValidator with mock verifier
      const mockSecretValidator = await hre.ethers.deployContract("SecretValidator", [mockVerifierAddr]);

      const validationId = 4;
      const hash = 9876n;

      // Setup configuration with the hash
      await mockSecretValidator.setConfig(validationId, [hash]);

      // Create parameters for validation
      const abiCoder = new ethersHardhat.AbiCoder();
      const pA = [1n, 2n];
      const pB = [
        [3n, 4n],
        [5n, 6n],
      ];
      const pC = [7n, 8n];

      // The mock verifier expects a uint[1] array for the public inputs
      // So we need to make sure our encoded parameters match this format
      const params = abiCoder.encode(["uint[2]", "uint[2][2]", "uint[2]", "uint256"], [pA, pB, pC, hash]);

      // First validation should pass with mock verifier always returning true
      await expect(mockSecretValidator.validate(validationId, params)).to.not.be.reverted;

      // Hash should now be marked as used
      expect(await mockSecretValidator.usedHashes(validationId, hash)).to.equal(true);

      // Second validation with same hash should be rejected
      await expect(mockSecretValidator.validate(validationId, params)).to.be.revertedWith("Hash already used");
    });

    it("Should validate with proper proof", async function () {
      // Deploy mock verifier first for simplified testing
      const mockVerifier = await hre.ethers.deployContract("MockGroth16Verifier");
      const mockVerifierAddr = await mockVerifier.getAddress();

      // Deploy SecretValidator with mock verifier
      const mockSecretValidator = await hre.ethers.deployContract("SecretValidator", [mockVerifierAddr]);

      const validationId = 6;
      const hash = 54321n;

      // Configure validator to accept our test hash
      await mockSecretValidator.setConfig(validationId, [hash]);

      // Create validation parameters with test proof data
      const abiCoder = new ethersHardhat.AbiCoder();
      const pA = [123n, 456n];
      const pB = [
        [789n, 101112n],
        [131415n, 161718n],
      ];
      const pC = [192021n, 222324n];
      const params = abiCoder.encode(["uint[2]", "uint[2][2]", "uint[2]", "uint256"], [pA, pB, pC, hash]);

      expect(await mockSecretValidator.usedHashes(validationId, hash)).to.equal(false);

      // Validation should pass with our mock verifier
      const tx = await mockSecretValidator.validate(validationId, params);
      await tx.wait();
      expect(await mockSecretValidator.usedHashes(validationId, hash)).to.equal(true);
    });

    it("Should reject used hashes", async function () {
      const mockVerifier = await hre.ethers.deployContract("MockGroth16Verifier");
      const mockVerifierAddr = await mockVerifier.getAddress();

      // Deploy SecretValidator with mock verifier
      const mockSecretValidator = await hre.ethers.deployContract("SecretValidator", [mockVerifierAddr]);

      const validationId = 6;
      const hash = 54321n;

      // Configure validator to accept our test hash
      await mockSecretValidator.setConfig(validationId, [hash]);

      // Create validation parameters with test proof data
      const abiCoder = new ethersHardhat.AbiCoder();
      const pA = [123n, 456n];
      const pB = [
        [789n, 101112n],
        [131415n, 161718n],
      ];
      const pC = [192021n, 222324n];
      const params = abiCoder.encode(["uint[2]", "uint[2][2]", "uint[2]", "uint256"], [pA, pB, pC, hash]);

      expect(await mockSecretValidator.usedHashes(validationId, hash)).to.equal(false);

      // Validation should pass with our mock verifier
      const tx = await mockSecretValidator.validate(validationId, params);
      await tx.wait();
      expect(await mockSecretValidator.usedHashes(validationId, hash)).to.equal(true);

      // Second validation with same hash should be rejected
      await expect(mockSecretValidator.validate(validationId, params)).to.be.revertedWith("Hash already used");
    });

    it("Should reject invalid hashes", async function () {
      // Use mock verifier for testing
      const mockVerifier = await hre.ethers.deployContract("MockGroth16Verifier");
      const mockVerifierAddr = await mockVerifier.getAddress();
      const mockSecretValidator = await hre.ethers.deployContract("SecretValidator", [mockVerifierAddr]);

      const validationId = 5;
      const validHash = 1111n;
      const invalidHash = 2222n;

      // Only configure the valid hash
      await mockSecretValidator.setConfig(validationId, [validHash]);

      // Create parameters for validation with invalid hash
      const abiCoder = new ethersHardhat.AbiCoder();
      const pA = [1n, 2n];
      const pB = [
        [3n, 4n],
        [5n, 6n],
      ];
      const pC = [7n, 8n];
      const params = abiCoder.encode(["uint[2]", "uint[2][2]", "uint[2]", "uint256"], [pA, pB, pC, invalidHash]);

      // Validation should fail with "Invalid hash" even though the mock verifier would approve the proof
      await expect(mockSecretValidator.validate(validationId, params)).to.be.revertedWith("Invalid hash");
    });

    it("Should reject invalid proofs", async function () {
      // Deploy a failing verifier mock
      const mockFailingVerifier = await hre.ethers.deployContract("MockFailingVerifier");
      const mockFailingVerifierAddr = await mockFailingVerifier.getAddress();

      // Deploy SecretValidator with failing verifier
      const mockSecretValidator = await hre.ethers.deployContract("SecretValidator", [mockFailingVerifierAddr]);

      const validationId = 7;
      const hash = 8888n;

      // Configure validator to accept our test hash
      await mockSecretValidator.setConfig(validationId, [hash]);

      // Create validation parameters
      const abiCoder = new ethersHardhat.AbiCoder();
      const pA = [1n, 2n];
      const pB = [
        [3n, 4n],
        [5n, 6n],
      ];
      const pC = [7n, 8n];
      const params = abiCoder.encode(["uint[2]", "uint[2][2]", "uint[2]", "uint256"], [pA, pB, pC, hash]);

      // Validation should fail with "Invalid proof" because the mock verifier returns false
      await expect(mockSecretValidator.validate(validationId, params)).to.be.revertedWith("Invalid proof");
    });
  });

  describe("Helper functions", function () {
    it("Should decode parameters correctly", async function () {
      const { secretValidator } = await loadFixture(deploySecretValidatorFixture);

      const pA = [10n, 20n];
      const pB = [
        [30n, 40n],
        [50n, 60n],
      ];
      const pC = [70n, 80n];
      const publicHash = 12345n;

      const abiCoder = new ethersHardhat.AbiCoder();
      const params = abiCoder.encode(["uint[2]", "uint[2][2]", "uint[2]", "uint256"], [pA, pB, pC, publicHash]);

      const decodedParams = await secretValidator.decodeParams(params);

      expect(decodedParams[0][0]).to.equal(pA[0]);
      expect(decodedParams[0][1]).to.equal(pA[1]);
      expect(decodedParams[1][0][0]).to.equal(pB[0][0]);
      expect(decodedParams[1][0][1]).to.equal(pB[0][1]);
      expect(decodedParams[1][1][0]).to.equal(pB[1][0]);
      expect(decodedParams[1][1][1]).to.equal(pB[1][1]);
      expect(decodedParams[2][0]).to.equal(pC[0]);
      expect(decodedParams[2][1]).to.equal(pC[1]);
      expect(decodedParams[3]).to.equal(publicHash);
    });

    it("Should convert address to field element", async function () {
      const { secretValidator, owner } = await loadFixture(deploySecretValidatorFixture);

      const addressAsField = await secretValidator.getAddressAsField(owner.address);
      expect(addressAsField).to.equal(ethersHardhat.toBigInt(owner.address));
    });

    it("Should provide correct public signals", async function () {
      const { secretValidator, user1 } = await loadFixture(deploySecretValidatorFixture);

      const publicHash = 98765n;

      // Call using a specific user to test msg.sender
      const signals = await secretValidator.connect(user1).getPublicSignals(publicHash);

      expect(signals[0]).to.equal(ethersHardhat.toBigInt(user1.address));
      expect(signals[1]).to.equal(0n); // Nonce should be 0 initially
      expect(signals[2]).to.equal(publicHash);
    });
  });
});
