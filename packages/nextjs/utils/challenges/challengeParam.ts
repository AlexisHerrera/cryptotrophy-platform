import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";
import { encodeAbiParameters, parseAbiParameters } from "viem";

export interface ChallengeData {
  // Organization data
  organizationId: bigint;
  maxPrizeAmount: bigint;
  // Challenge data
  description: string;
  prizeAmount: number;
  maxWinners: number;
  startTime: string;
  endTime: string;
  // Validator data
  selectedValidator: string;
  params: Record<string, any>;
}

// Function to calculate the Poseidon hash of a string
export const calculateSecretHash = async (secretStr: string): Promise<bigint> => {
  // Skip empty strings
  if (!secretStr.trim()) return 0n;

  try {
    const poseidon = await buildPoseidon();
    // Convert string to numeric representation
    const secret = BigInt(Buffer.from(secretStr).reduce((acc, byte) => acc * 256n + BigInt(byte), 0n));

    // Calculate hash using Poseidon with 1 input (just the secret)
    const hash = poseidon.F.toString(poseidon([secret]));
    return BigInt(hash);
  } catch (error) {
    console.error("Error calculating hash:", error);
    alert(`Failed to hash secret code: ${secretStr}`);
    return 0n;
  }
};

export const getValidatorUID = (userSelection: string, params: Record<string, string>) => {
  if (userSelection === "CustomValidator") {
    return params.validatorUID;
  }
  return userSelection;
};

export const getValidatorAddress = (userSelection: string, params: Record<string, string>) => {
  if (userSelection === "" || userSelection === undefined) {
    return "0x0000000000000000000000000000000000000000";
  }
  let validatorAddress: string | undefined = undefined;
  if (userSelection === "CustomValidator") {
    validatorAddress = params["address"];
  } else {
    const validatorAddresses: Record<string, string | undefined> = {
      OffChainValidatorV2: params.OffChainApiValidatorAddress,
      SecretValidatorV1: params.SecretValidatorAddress,
      RandomValidatorV1: params.RandomValidatorAddress,
    };
    validatorAddress = validatorAddresses[userSelection];
  }

  if (validatorAddress === "0x0000000000000000000000000000000000000000" || validatorAddress === undefined) {
    throw new Error("Validator address could not be read.");
  }
  return validatorAddress;
};

export const getEncodedValidatorConfig = async (
  userSelection: string,
  params: Record<string, string>,
  challangeManagerAddress: string | undefined,
) => {
  let hexParams: `0x${string}` = "0x";
  const abiCoder = new ethers.AbiCoder();

  if (userSelection === "OnChainValidatorV1") {
    // Configure public hash in validator
    const publicHash = BigInt(params.challengeHash);
    hexParams = abiCoder.encode(["uint256"], [publicHash]) as `0x${string}`;
  } else if (userSelection === "OffChainValidatorV2") {
    if (challangeManagerAddress === undefined) {
      throw new Error("Invalid challangeManagerAddress address");
    }
    hexParams = abiCoder.encode(
      ["string", "string", "address"],
      [params.url, params.path, challangeManagerAddress],
    ) as `0x${string}`;
  } else if (userSelection === "SecretValidatorV1") {
    // Parse the secret codes from the textarea
    const secretCodes = params.secretCodes.split("\n").filter(line => line.trim() !== "");

    // Calculate hashes for each secret code
    const hashes = await Promise.all(secretCodes.map(code => calculateSecretHash(code.trim())));

    // Filter out any failed hashes (0n)
    const validHashes = hashes.filter(hash => hash !== 0n);

    if (validHashes.length === 0) {
      throw new Error("No valid secret codes provided");
    }
    hexParams = abiCoder.encode(["uint256", "uint256[]"], [validHashes.length, validHashes]) as `0x${string}`;
  } else if (userSelection === "RandomValidatorV1") {
    if (challangeManagerAddress === undefined) {
      throw new Error("Invalid challangeManagerAddress address");
    }
    const successProbability = BigInt(params.successProbability);
    const requiredPaymentWei = BigInt(params.requiredPaymentWei);
    hexParams = abiCoder.encode(
      ["uint256", "address", "uint256"],
      [successProbability, challangeManagerAddress, requiredPaymentWei],
    ) as `0x${string}`;
  } else if (userSelection === "CustomValidator") {
    hexParams = encodeCustomAbiParams(params);
  } else if (userSelection === "") {
    hexParams = abiCoder.encode([], []) as `0x${string}`;
  } else {
    throw new Error("Invalid validator");
  }

  return hexParams;
};

function encodeCustomAbiParams(parameterData: Record<string, string>): `0x${string}` {
  // Parse abiParams from parameterData
  let abiParams: { type: string; value: string }[] = [];
  try {
    abiParams = typeof parameterData.abiParams === "string" ? JSON.parse(parameterData.abiParams) : [];
  } catch {
    abiParams = [];
  }

  // Build types and values arrays
  const types = abiParams.map(param => param.type);
  const values = abiParams.map(param => {
    // Convert value based on type
    if (param.type === "uint256") {
      return BigInt(param.value); // Numbers must be BigInt for encoding
    }
    if (param.type === "address") {
      return param.value.toLowerCase(); // Ensure checksum/valid address
    }
    // Default (e.g., "string")
    return param.value;
  });

  // Encode
  const encoded = encodeAbiParameters(
    parseAbiParameters(types.map(t => `${t} param`).join(",")), // e.g., "uint256 param,address param"
    values,
  );
  return encoded;
}
