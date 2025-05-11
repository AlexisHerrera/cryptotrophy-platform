import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers as ethersHardhat } from "hardhat";

describe("RandomValidator contract", function () {
  async function deployRandomValidatorFixture() {
    const [owner, admin1, user1, user2, outsider] = await ethersHardhat.getSigners();

    const coord = await hre.ethers.deployContract("ChainlinkVrfCoordinatorMock", [
      100000000000000000n,
      1000000000,
      7353135730430530,
    ]);
    const coord_addr = await coord.getAddress();

    // Set subscription
    const subs = await coord.createSubscription();
    const receipt = await subs.wait();

    const { args } = receipt.logs[0];
    const subsId = args[0];

    // Fund subscription
    const fundsubs = await coord.fundSubscription(subsId, 13615227254092620456000n);
    await fundsubs.wait();

    const validatorUID = hre.ethers.encodeBytes32String("RandomValidatorV2");
    const randomValidator = await hre.ethers.deployContract("RandomValidator", [
      subsId,
      coord_addr,
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
      validatorUID,
    ]);

    const randomValidatorAddr = await randomValidator.getAddress();

    const addConsum = await coord.addConsumer(subsId, randomValidatorAddr);
    await addConsum.wait();

    return {
      owner,
      admin1,
      user1,
      user2,
      outsider,
      randomValidator,
      coord,
    };
  }

  describe("simulatedVRFCall", function () {
    it("Should validate when VRF reports the correct result", async function () {
      const { owner, randomValidator, coord } = await loadFixture(deployRandomValidatorFixture);

      // Configure validator
      const tx = await randomValidator.setConfig(1n, 100n, "0x0000000000000000000000000000000000000000", 0);
      await tx.wait();

      // Make VRF call
      const tx2 = await randomValidator.preValidation(1n, "0x");
      await tx2.wait();

      // Simulate VRF response
      const randomValidatorAddr = await randomValidator.getAddress();

      // The requestId is initialized in VRFCoordinatorMock. It is an incremental value from 1.
      const requestId = 1;

      const fullfill = await coord.fulfillRandomWordsWithOverride(requestId, randomValidatorAddr, [13]);
      await fullfill.wait();

      // Test Validation
      const abiCoder = new ethersHardhat.AbiCoder();
      const params = abiCoder.encode(["address[1]"], [[owner.address]]);
      expect(await randomValidator.validate(1n, params)).to.equal(true);
    });
  });
});
