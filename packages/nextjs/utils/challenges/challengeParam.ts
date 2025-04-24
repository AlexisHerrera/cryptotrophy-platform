import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";

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
  validatorUID: string;
  validatorAddress: string;
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
    console.log(`Secret code "${secretStr}" hashed to: ${hash}`);
    return BigInt(hash);
  } catch (error) {
    console.error("Error calculating hash:", error);
    alert(`Failed to hash secret code: ${secretStr}`);
    return 0n;
  }
};

export const getEncodedValidatorConfig = async (
  algorithm: string,
  params: Record<string, string>,
  challangeManagerAddress: string | undefined,
) => {
  let hexParams: `0x${string}` = "0x";
  const abiCoder = new ethers.AbiCoder();

  if (algorithm === "OnChainValidatorV1") {
    // Configure public hash in validator
    const publicHash = BigInt(params.challengeHash);
    hexParams = abiCoder.encode(["uint256"], [publicHash]) as `0x${string}`;
  } else if (algorithm === "OffChainValidatorV2") {
    if (challangeManagerAddress === undefined) {
      throw new Error("Invalid challangeManagerAddress address");
    }
    hexParams = abiCoder.encode(
      ["string", "string", "address"],
      [params.url, params.path, challangeManagerAddress],
    ) as `0x${string}`;
  } else if (algorithm === "SecretValidatorV1") {
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
  } else if (algorithm === "RandomValidatorV1") {
    if (challangeManagerAddress === undefined) {
      throw new Error("Invalid challangeManagerAddress address");
    }
    const successProbability = BigInt(params.successProbability);
    console.log("successProbability", successProbability);
    hexParams = abiCoder.encode(["uint256", "address"], [successProbability, challangeManagerAddress]) as `0x${string}`;
  } else if (algorithm === "") {
    hexParams = abiCoder.encode([], []) as `0x${string}`;
  } else {
    throw new Error("Invalid validator");
  }

  return hexParams;
};
