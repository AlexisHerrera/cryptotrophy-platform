import React, { useEffect, useState } from "react";
import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClaimChallengeSecretModalProps {
  orgId: bigint;
  challengeId: bigint;
  onClose: () => void;
}

// Update paths to point to the actual location of the files
const CIRCUIT_WASM_URL = "/circuits/secret_code.wasm";
const PROVING_KEY_URL = "/circuits/secret_code.zkey";

const ClaimChallengeSecretModal: React.FC<ClaimChallengeSecretModalProps> = ({ orgId, challengeId, onClose }) => {
  const [secretValue, setSecretValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState<bigint>(0n);
  const [isSecretValid, setIsSecretValid] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [zkProof, setZkProof] = useState<any>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  // Add state for the proof modal
  const [showProofModal, setShowProofModal] = useState(false);
  // Add state to track if validation was triggered
  const [validationTriggered, setValidationTriggered] = useState(false);

  // Use the hook with a state-dependent value
  const { data: isValidHash, isLoading: isLoadingHash } = useScaffoldReadContract({
    contractName: "SecretValidator",
    functionName: "config",
    args: [challengeId, currentHash],
    query: {
      // Only enable the query when a hash is set and validation was triggered
      enabled: currentHash !== 0n && validationTriggered,
    },
  });

  // Update validation state when hash validation changes
  useEffect(() => {
    // Only react when loading finishes and validation was explicitly triggered
    if (!isLoadingHash && validationTriggered) {
      const valid = !!isValidHash;
      setIsSecretValid(valid);
      if (valid) {
        setValidationMessage("✅ Valid secret code!");
      } else {
        // Ensure we don't show "invalid" if the hash is 0 (initial state or empty input)
        if (currentHash !== 0n) {
          setValidationMessage("❌ Invalid secret code. Please try a different one.");
        } else {
          setValidationMessage(null); // Clear message if hash is 0
        }
      }
      // Reset the trigger after processing the result
      setValidationTriggered(false);
    }
  }, [isValidHash, isLoadingHash, validationTriggered, currentHash]);

  const { writeContractAsync: claimReward } = useScaffoldWriteContract("ChallengeManager");

  // Function to calculate the Poseidon hash of a string
  const calculateSecretHash = async (secretStr: string): Promise<bigint> => {
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

  // Generate input for ZK proof
  const generateInput = async (secretStr: string) => {
    try {
      // Initialize Poseidon
      const poseidon = await buildPoseidon();

      // Convert string to numeric representation
      const secret = BigInt(Buffer.from(secretStr).reduce((acc, byte) => acc * 256n + BigInt(byte), 0n));

      // Calculate hash using Poseidon with 1 input (just the secret)
      const hash = poseidon([secret]);

      // Create input object - use the raw field element output from Poseidon
      const input = {
        secret: secret.toString(),
        publicHash: poseidon.F.toString(hash), // Convert to field element string
      };

      console.log("Generated ZK input:", input);
      return input;
    } catch (error) {
      console.error("Error generating input:", error);
      throw error;
    }
  };

  // Simplified function to generate the proof directly using snarkjs.groth16.fullProve
  const generateProof = async (input: any): Promise<{ proof: any; publicSignals: any }> => {
    try {
      console.log("Generating proof with input:", JSON.stringify(input));

      // Dynamically import snarkjs
      const snarkjs = await import("snarkjs");

      // Use the fullProve method which handles both witness generation and proof generation
      console.log("Calling groth16.fullProve with wasmPath:", CIRCUIT_WASM_URL, "and zkeyPath:", PROVING_KEY_URL);
      const { proof, publicSignals } = await (snarkjs as any).groth16.fullProve(
        input,
        CIRCUIT_WASM_URL,
        PROVING_KEY_URL,
      );

      console.log("Proof generation successful");
      console.log("Proof:", proof);
      console.log("Public signals:", publicSignals);

      return { proof, publicSignals };
    } catch (error) {
      console.error("Error generating proof:", error);
      throw new Error(`Failed to generate proof: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Format proof for smart contract verification
  const formatProofForContract = (proof: any) => {
    return [
      proof.pi_a[0],
      proof.pi_a[1],
      proof.pi_b[0][1],
      proof.pi_b[0][0],
      proof.pi_b[1][1],
      proof.pi_b[1][0],
      proof.pi_c[0],
      proof.pi_c[1],
    ].map(x => x.toString());
  };

  // Function to handle the full proof generation process
  const handleGenerateProof = async () => {
    if (!secretValue.trim() || !isSecretValid) {
      return;
    }

    try {
      setGeneratingProof(true);
      setProofError(null);

      // Generate the input for the ZK proof
      const input = await generateInput(secretValue.trim());
      console.log("ZK proof input generated:", input);

      try {
        // Generate proof directly using the fullProve method
        const { proof, publicSignals } = await generateProof(input);

        // Format the proof for contract verification
        const formattedProof = formatProofForContract(proof);

        // Store the full proof data
        const proofData = {
          input,
          proof,
          publicSignals,
          formattedProof,
        };

        setZkProof(proofData);
        console.log("Full proof data:", proofData);
      } catch (error) {
        console.error("Error in proof generation:", error);
        setProofError(`Proof generation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      console.error("Error generating ZK proof:", error);
      setProofError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setGeneratingProof(false);
    }
  };

  // Validate the secret code before attempting to claim
  const validateSecretCode = async () => {
    if (!secretValue.trim()) {
      setValidationMessage("Please enter a secret code");
      setIsSecretValid(false);
      setCurrentHash(0n); // Reset hash for empty input
      setValidationTriggered(false); // Ensure no stale validation runs
      return;
    }

    try {
      // Reset previous state
      setIsSecretValid(false);
      setValidationMessage("Validating your secret code...");
      setValidationTriggered(false); // Reset trigger before starting new validation

      // Calculate the hash of the secret code
      const secretHash = await calculateSecretHash(secretValue.trim());

      // Update current hash and trigger validation
      setCurrentHash(secretHash);
      setValidationTriggered(true); // Set trigger to start the useScaffoldReadContract query

      // Note: The useEffect will now handle the result when isLoadingHash changes to false
    } catch (error) {
      console.error("Error calculating hash during validation:", error);
      setValidationMessage(`Error hashing code: ${error instanceof Error ? error.message : String(error)}`);
      setIsSecretValid(false);
      setCurrentHash(0n);
      setValidationTriggered(false);
    }
  };

  const handleClaim = async () => {
    if (!secretValue.trim()) {
      alert("Please enter a secret code");
      return;
    }

    try {
      setLoading(true);
      console.log("Processing secret code for challenge", challengeId.toString());

      // Calculate the hash of the secret code
      const secretHash = await calculateSecretHash(secretValue.trim());
      if (secretHash === 0n) {
        throw new Error("Failed to hash the secret code");
      }

      // Set the current hash for validation and wait for the check
      setCurrentHash(secretHash);

      // Wait a moment to ensure the hook updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now check if the hash is valid
      if (!isValidHash) {
        alert("This secret code is not valid for this challenge. Please try a different one.");
        setLoading(false);
        return;
      }

      // Check if we already have a proof, if not, generate one
      let proofData = zkProof;
      if (!proofData) {
        setProofError(null);
        console.log("Generating ZK proof for claim...");

        try {
          // Generate the input for the ZK proof
          const input = await generateInput(secretValue.trim());

          // Generate the proof
          const { proof, publicSignals } = await generateProof(input);

          // Format the proof for contract verification
          const formattedProof = formatProofForContract(proof);

          proofData = {
            input,
            proof,
            publicSignals,
            formattedProof,
          };

          setZkProof(proofData);
          console.log("Proof generated for claim:", proofData);
        } catch (error) {
          console.error("Error generating proof for claim:", error);
          alert(`Failed to generate proof: ${error instanceof Error ? error.message : String(error)}`);
          setLoading(false);
          return;
        }
      }

      // Encode the proof data according to the contract's expected format
      console.log("Preparing proof for contract...");

      // Extract proof components from the proof data
      const { proof } = proofData;

      // Format the arrays as expected by the contract
      const pA = [proof.pi_a[0], proof.pi_a[1]];
      const pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ];
      const pC = [proof.pi_c[0], proof.pi_c[1]];

      // Get the public hash from the input
      const publicHash = BigInt(proofData.input.publicHash);

      console.log("Proof components:", {
        pA,
        pB,
        pC,
        publicHash: publicHash.toString(),
      });

      // Create an ABI coder instance
      const abiCoder = new ethers.AbiCoder();

      // Encode the parameters as expected by the contract
      const params = abiCoder.encode(
        ["uint256[2]", "uint256[2][2]", "uint256[2]", "uint256"],
        [pA, pB, pC, publicHash],
      );

      console.log("Encoded params:", params);

      // Convert to the expected hex format
      const hexParams: `0x${string}` = params as `0x${string}`;

      console.log("Submitting claim to contract...");

      // Call the claimReward function with the challenge ID and the encoded params
      await claimReward({
        functionName: "claimReward",
        args: [challengeId, hexParams],
      });

      alert("Reward claimed successfully!");
      onClose();
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Failed to claim reward. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center text-info">Claim Reward with Secret Code</h2>

        <p className="mb-4 text-center">
          Enter the secret code to claim the reward for challenge <strong>{challengeId.toString()}</strong>
        </p>

        <div className="mb-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter your secret code"
            className="input input-bordered w-full max-w-xs mb-2"
            value={secretValue}
            onChange={e => {
              setSecretValue(e.target.value);
              setValidationMessage(null); // Clear validation message
              setIsSecretValid(false); // Reset validation status
              setCurrentHash(0n); // Reset hash
              setValidationTriggered(false); // Reset trigger
            }}
          />

          <button
            className="btn btn-sm btn-secondary mb-2"
            onClick={validateSecretCode}
            disabled={isLoadingHash || !secretValue.trim()} // Disable while loading hash or if input is empty
          >
            {isLoadingHash && validationTriggered ? "Validating..." : "Validate Code"}
          </button>

          {validationMessage && (
            <div
              className={`text-sm mt-1 ${validationMessage.includes("✅") ? "text-success" : validationMessage.includes("❌") ? "text-error" : "text-info"}`}
            >
              {validationMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <button
            className="btn btn-secondary"
            onClick={handleGenerateProof}
            disabled={!isSecretValid || generatingProof || !secretValue.trim()}
          >
            {generatingProof ? "Generating Proof..." : "Generate ZK Proof"}
          </button>

          {proofError && <div className="mt-2 p-2 bg-error/20 rounded text-error text-sm">{proofError}</div>}

          {zkProof && (
            <div className="mt-4 flex flex-col items-center bg-success/10 rounded-lg p-4 border border-success">
              <div className="flex items-center gap-2 text-success font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Proof generated successfully!
              </div>
              <button className="btn btn-sm btn-primary mt-3" onClick={() => setShowProofModal(true)}>
                View Proof Details
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleClaim}
            disabled={loading || isLoadingHash || !secretValue.trim() || !zkProof} // Also disable if hash is loading
          >
            {loading ? "Claiming..." : "Claim Reward"}
          </button>
        </div>
      </div>

      {/* Proof Modal */}
      {showProofModal && zkProof && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-base-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">Zero-Knowledge Proof</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setShowProofModal(false)}>
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="badge badge-primary">pi_a</div>
                  <h4 className="font-medium">Proof Component A</h4>
                </div>
                <div className="bg-base-200 p-3 rounded-md overflow-x-auto text-xs font-mono">
                  {zkProof.proof.pi_a.map((value: string, index: number) => (
                    <div key={`pi_a_${index}`} className="mb-1 break-all">
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="badge badge-secondary">pi_b</div>
                  <h4 className="font-medium">Proof Component B</h4>
                </div>
                <div className="bg-base-200 p-3 rounded-md overflow-x-auto text-xs font-mono">
                  {zkProof.proof.pi_b.map((row: string[], rowIndex: number) => (
                    <div key={`pi_b_row_${rowIndex}`} className="mb-2">
                      {row.map((value: string, colIndex: number) => (
                        <div key={`pi_b_${rowIndex}_${colIndex}`} className="mb-1 break-all">
                          {value}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="badge badge-accent">pi_c</div>
                  <h4 className="font-medium">Proof Component C</h4>
                </div>
                <div className="bg-base-200 p-3 rounded-md overflow-x-auto text-xs font-mono">
                  {zkProof.proof.pi_c.map((value: string, index: number) => (
                    <div key={`pi_c_${index}`} className="mb-1 break-all">
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              {zkProof.publicSignals && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="badge badge-info">public</div>
                    <h4 className="font-medium">Public Signals</h4>
                  </div>
                  <div className="bg-base-200 p-3 rounded-md overflow-x-auto text-xs font-mono">
                    {Array.isArray(zkProof.publicSignals) ? (
                      zkProof.publicSignals.map((value: string, index: number) => (
                        <div key={`signal_${index}`} className="mb-1 break-all">
                          {value}
                        </div>
                      ))
                    ) : (
                      <div className="break-all">{JSON.stringify(zkProof.publicSignals)}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-base-200 flex justify-end">
              <button className="btn btn-primary" onClick={() => setShowProofModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ClaimChallengeSecretModal;
