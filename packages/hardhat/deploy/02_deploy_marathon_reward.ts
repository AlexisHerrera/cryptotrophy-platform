import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "MarathonTrophyV1" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMarathonTrophyV1: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  await deploy("MarathonTrophyV1", {
    from: deployer,
    // Contract constructor arguments
    // address _oracle, bytes32 _jobId, address _link
    args: ["0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD", "0x779877A7B0D9E8603169DdbD7836e478b4624789"],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const marathonTrophyV1 = await hre.ethers.getContract<Contract>("MarathonTrophyV1", deployer);
  console.log("👋 Reward ammount:", await marathonTrophyV1.rewardAmount());
};

export default deployMarathonTrophyV1;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MarathonTrophyV1
deployMarathonTrophyV1.tags = ["MarathonTrophyV1"];
