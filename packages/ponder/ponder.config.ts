import { createConfig } from "ponder";
import { http } from "viem";
import { hardhat, baseSepolia } from "viem/chains";
import { deployedContracts } from "@se-2/config";

const isDev = process.env.NODE_ENV !== "production";

const targetNetwork = isDev ? hardhat : baseSepolia;

const rpcUrl =
    process.env[`PONDER_RPC_URL_${targetNetwork.id}`] ||
    (isDev ? "http://127.0.0.1:8545" : "");

if (!rpcUrl && !isDev) {
  throw new Error(
      `Must define PONDER_RPC_URL_${targetNetwork.id} environment variable`,
  );
}

if (!(targetNetwork.id in deployedContracts)) {
  throw new Error(
      `No deployedContracts entry found for chain ${targetNetwork.id} (${targetNetwork.name}).\n` +
      `    Did you forget running "yarn deploy --network ${targetNetwork.name}" ?`
  );
}

const networks = {
  [targetNetwork.name]: {
    chainId: targetNetwork.id,
    transport: http(rpcUrl),
  },
};

const contractNames = Object.keys(deployedContracts[targetNetwork.id]);
const contracts = Object.fromEntries(
    contractNames.map((contractName) => [
      contractName,
      {
        network: targetNetwork.name,
        abi: deployedContracts[targetNetwork.id][contractName].abi,
        address:
        deployedContracts[targetNetwork.id][contractName].address,
        startBlock:
            deployedContracts[targetNetwork.id][contractName].startBlock || 0,
      },
    ])
);

export default createConfig({
  networks,
  contracts,
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL!,
  },
});
