import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { developmentChains } from "../helperconfig";

/**
 * Deploys a contract named "OffChainValidator" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployOffChainValidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  await deploy("OffChainValidator", {
    from: deployer,
    args: ["0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD", "0x779877A7B0D9E8603169DdbD7836e478b4624789"],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const offChainValidator = await hre.ethers.getContract<Contract>("OffChainValidator", deployer);
  const offChainValidatorAddr = await offChainValidator.getAddress();
  console.log("👋 Off chain validator deployed to:", offChainValidatorAddr);

  if (developmentChains.includes(network.name)) {
    const mocklink = await hre.ethers.getContract<Contract>("MockLinkToken", deployer);
    await mocklink.setBalance(offChainValidatorAddr, 10n ** 23n);
  }
};

export default deployOffChainValidator;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags OffChainValidator
deployOffChainValidator.tags = ["OffChainValidator"];
