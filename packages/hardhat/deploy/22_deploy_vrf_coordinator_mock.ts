import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { developmentChains } from "../helperconfig";

/**
 * Deploys a contract named "ChainlinkVrfCoordinatorMock" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployChainlinkVrfCoordinatorMock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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
  const { network } = hre;

  if (developmentChains.includes(network.name)) {
    await deploy("ChainlinkVrfCoordinatorMock", {
      from: deployer,
      args: [100000000000000000n, 1000000000, 7353135730430530],
      log: true,
      autoMine: true,
    });

    // Get the deployed contract to interact with it after deploying.
    const chainlinkVrfCoordinatorMock = await hre.ethers.getContract<Contract>("ChainlinkVrfCoordinatorMock", deployer);
    console.log("👋 Coordinator address", await chainlinkVrfCoordinatorMock.getAddress());
  } else {
    console.log("Non-development network detected; skipping ChainlinkVrfCoordinatorMock deployment.");
  }
};

export default deployChainlinkVrfCoordinatorMock;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ChainlinkVrfCoordinatorMock
deployChainlinkVrfCoordinatorMock.tags = ["ChainlinkVrfCoordinatorMock"];
