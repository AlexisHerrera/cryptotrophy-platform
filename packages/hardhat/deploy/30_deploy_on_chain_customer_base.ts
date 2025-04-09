import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "CustomerBaseContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployCustomerBaseContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  await deploy("OnChainCustomerBase", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const customerBaseContract = await hre.ethers.getContract<Contract>("OnChainCustomerBase", deployer);
  const customerBaseContractAddr = await customerBaseContract.getAddress();
  console.log("👋 OnChainCustomerBase address:", customerBaseContractAddr);

  // Add OnChainCustomerBase to organization contract.
  const organizationManager = await hre.ethers.getContract<Contract>("OrganizationManager", deployer);
  const customerBaseUID = hre.ethers.encodeBytes32String("OnChainCustomerBaseV1");
  await organizationManager.registerCustomerBase(customerBaseUID, customerBaseContractAddr);
};

export default deployCustomerBaseContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags CustomerBaseContract
deployCustomerBaseContract.tags = ["CustomerBaseContract"];
