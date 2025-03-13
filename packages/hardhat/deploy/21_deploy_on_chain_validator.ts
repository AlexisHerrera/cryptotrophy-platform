import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "ValidatorContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployValidatorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  // Get the deployed contract to interact with it after deploying.
  const grothVerifierContract = await hre.ethers.getContract<Contract>("Groth16Verifier", deployer);
  const grothVerifierContractAddress = grothVerifierContract.target;

  await deploy("OnChainValidator", {
    from: deployer,
    args: [grothVerifierContractAddress],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const validatorContract = await hre.ethers.getContract<Contract>("OnChainValidator", deployer);
  const validatorContractAddr = await validatorContract.getAddress();
  console.log("👋 OnChainValidator address:", validatorContractAddr);

  // Add OnChainValidator to challenge manager registred validators.
  const validatorRegistry = await hre.ethers.getContract<Contract>("ValidatorRegistry", deployer);
  const validatorUID = hre.ethers.encodeBytes32String("OnChainValidatorV1");
  await validatorRegistry.registerValidator(validatorUID, validatorContractAddr);
};

export default deployValidatorContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ValidatorContract
deployValidatorContract.tags = ["ValidatorContract"];
