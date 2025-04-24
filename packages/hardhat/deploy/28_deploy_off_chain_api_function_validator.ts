import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { developmentChains } from "../helperconfig";
import { readFileSync } from "fs";
import * as path from "path";

/**
 * Deploys a contract named "OffChainApiValidator" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployOffChainApiValidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  let routerAddress = "0xf9B8fc078197181C841c296C876945aaa425B278";
  const donid = "0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000";
  if (developmentChains.includes(network.name)) {
    const routermock = await hre.ethers.getContract<Contract>("RouterMock", deployer);
    routerAddress = await routermock.getAddress();
  }

  const sourcePath = path.resolve(__dirname, "../chainlinkcode/apifunctionvalidator.js");
  const source = readFileSync(sourcePath, "utf8");
  const subscriptionId = 297;
  const validatorUID = hre.ethers.encodeBytes32String("OffChainValidatorV2");

  await deploy("OffChainApiValidator", {
    from: deployer,
    args: [routerAddress, donid, source, subscriptionId, validatorUID],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const validator = await hre.ethers.getContract<Contract>("OffChainApiValidator", deployer);
  const validatorAddr = await validator.getAddress();
  console.log("👋 Off chain api function validator deployed to:", validatorAddr);

  // Add OffChainApiValidator to challenge manager registred validators.
  const validatorRegistry = await hre.ethers.getContract<Contract>("ValidatorRegistry", deployer);
  await validatorRegistry.registerValidator(validatorUID, validatorAddr);
};

export default deployOffChainApiValidator;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags OffChainValidator
deployOffChainApiValidator.tags = ["OffChainApiValidator"];
