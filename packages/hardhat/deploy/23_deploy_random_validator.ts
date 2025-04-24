import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { developmentChains } from "../helperconfig";

/**
 * Deploys a contract named "RandomValidator" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployRandomValidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  let subsId;
  let coord_addr;

  if (developmentChains.includes(network.name)) {
    const coord = await hre.ethers.getContract<Contract>("ChainlinkVrfCoordinatorMock", deployer);
    coord_addr = await coord.getAddress();
    console.log(`CoordinatorMock deployed to: ${coord_addr}`);

    // Set subscription
    const subs = await coord.createSubscription();
    const receipt = await subs.wait();

    const { args } = receipt.logs[0];
    subsId = args[0];
    console.log("Subscription id:", subsId);

    // Found subscription
    const fundsubs = await coord.fundSubscription(subsId, 13615227254092620456000n);
    await fundsubs.wait();
  } else {
    // TODO: Configure subsId and coord based on network ID
    subsId = 297;
    coord_addr = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE";
  }

  const validatorUID = hre.ethers.encodeBytes32String("RandomValidatorV1");

  await deploy("RandomValidator", {
    from: deployer,
    args: [subsId, coord_addr, "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", validatorUID],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const randomValidator = await hre.ethers.getContract<Contract>("RandomValidator", deployer);
  const randomValidatorAddr = await randomValidator.getAddress();
  console.log("👋 RandomValidator address:", randomValidatorAddr);

  // Add RandomValidator to challenge manager registred validators.
  const validatorRegistry = await hre.ethers.getContract<Contract>("ValidatorRegistry", deployer);
  await validatorRegistry.registerValidator(validatorUID, randomValidatorAddr);

  if (developmentChains.includes(network.name)) {
    // Set RandomValidator as subscription consumer
    const coord = await hre.ethers.getContract<Contract>("ChainlinkVrfCoordinatorMock", deployer);
    const addConsum = await coord.addConsumer(subsId, randomValidatorAddr);
    await addConsum.wait();
  }
};

export default deployRandomValidator;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RandomValidator
deployRandomValidator.tags = ["RandomValidator"];
