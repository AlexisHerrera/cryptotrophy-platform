import React, { useState } from "react";
import { ethers } from "ethers";
import { groth16 } from "snarkjs";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClaimChallengeModalProps {
  orgId: bigint;
  challengeId: bigint;
  onClose: () => void;
}

const ClaimChallengeOnChainModal: React.FC<ClaimChallengeModalProps> = ({ orgId, challengeId, onClose }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { writeContractAsync: claimReward } = useScaffoldWriteContract("ChallengeManager");
  const { data: validatorConfig } = useScaffoldReadContract({
    contractName: "OffChainValidator",
    functionName: "getConfig",
    args: [challengeId],
  });

  const handleClaim = async () => {
    if (validatorConfig !== undefined) {
      try {
        setLoading(true);
        console.log("Org ID", orgId, "Challenge ID", challengeId);

        const inputJson = JSON.parse(validatorConfig);
        if ("public_hash" in inputJson) {
          console.log("On chain validator detected");

          const challengeHash = BigInt(inputJson["public_hash"]);

          const input = {
            in: BigInt(inputValue),
            hash: challengeHash,
          };
          console.log(input);

          const { proof, publicSignals } = await groth16.fullProve(input, "/validate_hash.wasm", "/circuit_0000.zkey");

          // Generate calldata to send to the contract
          const callData = await groth16.exportSolidityCallData(proof, publicSignals);

          console.log("Proof: ", proof);
          console.log("Public Signals: ", publicSignals);
          console.log("Call Data: ", callData);

          if (callData) {
            const { pA, pB, pC } = parseCallData(callData);

            // Create an ABI coder instance
            const abiCoder = new ethers.AbiCoder();

            // Encode the parameters into bytes
            const params = abiCoder.encode(["uint256[2]", "uint256[2][2]", "uint256[2]"], [pA, pB, pC]);
            const hexParams: `0x${string}` = params as `0x${string}`;

            await claimReward({
              functionName: "claimReward",
              args: [challengeId, hexParams],
            });
          }
        }

        alert("Reward claimed successfully!");
        onClose();
      } catch (error) {
        console.error("Error claiming reward:", error);
        alert("Failed to claim reward. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const parseCallData = (callData: string) => {
    const argv = callData.replace(/["[\]\s]/g, "").split(",");
    const pA = [BigInt(argv[0]), BigInt(argv[1])];
    const pB = [
      [BigInt(argv[2]), BigInt(argv[3])],
      [BigInt(argv[4]), BigInt(argv[5])],
    ];
    const pC = [BigInt(argv[6]), BigInt(argv[7])];
    return { pA, pB, pC };
  };

  const hasOnChainValidator = () => {
    if (validatorConfig !== undefined) {
      const inputJson = JSON.parse(validatorConfig);
      return "public_hash" in inputJson;
    }
    return false;
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center" style={{ color: "green" }}>
          Claim Reward
        </h2>

        {hasOnChainValidator() && (
          <>
            <p className="mb-4 text-center" style={{ color: "green" }}>
              Set secret token to claim the reward for challenge <strong>{challengeId.toString()}</strong>?
            </p>

            <div className="mb-4 flex justify-center">
              <input
                type="text"
                placeholder="Secret Input"
                className="input input-bordered w-full max-w-xs"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex justify-center gap-4">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleClaim} disabled={loading}>
            {loading ? "Claiming..." : "Claim Reward"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimChallengeOnChainModal;
