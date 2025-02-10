import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { developmentChains } from "../helperconfig";

/**
 * Deploys a contract named "MockLink" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMockLinkToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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
    await deploy("MockLinkToken", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });

    const mockLinkToken = await hre.ethers.getContract<Contract>("MockLinkToken", deployer);
    console.log("👋 MockLinkToken address: ", await mockLinkToken.getAddress());
  } else {
    console.log("Non-development network detected; skipping MockLinkToken deployment.");
  }
};

export default deployMockLinkToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ChainlinkVrfCoordinatorMock
deployMockLinkToken.tags = ["MockLinkToken"];
