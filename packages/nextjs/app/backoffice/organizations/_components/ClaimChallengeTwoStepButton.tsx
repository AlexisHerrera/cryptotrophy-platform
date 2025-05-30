"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ValidatorContractName } from "./KnownValidators";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClaimRewardButtonProps {
  challengeId: bigint;
  contractName: ValidatorContractName;
  // Optional configuration for backoff
  backoffConfig?: {
    maxAttempts: number;
    initialDelay: number; // in milliseconds
    factor: number;
  };
}

// Optional mapping for state descriptions (used for the tooltip)
const stateDescriptions: Record<string, string> = {
  NOSTATE: "No operation initiated yet.",
  "PENDING REQUEST": "No operation initiated yet.",
  PREVALIDATION: "Pre-validation is in progress.",
  SUCCESS: "Validation was successful. Claiming request.",
  FAIL: "Validation failed. Check with the organization.",
};

const stateStyles: { [key: string]: string } = {
  PREVALIDATION: "bg-yellow-200 text-yellow-800",
  SUCCESS: "bg-green-200 text-green-800",
  FAIL: "bg-red-200 text-red-800",
};

const ClaimChallengeTwoStepButton: React.FC<ClaimRewardButtonProps> = ({
  challengeId,
  contractName,
  backoffConfig = { maxAttempts: 5, initialDelay: 500, factor: 2 },
}) => {
  const [loading, setLoading] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState<boolean>(true);
  const [validationState, setValidationState] = useState<string>("");

  const { writeContractAsync: twoStepValidator } = useScaffoldWriteContract(contractName);

  const { data: validatorConfig } = useScaffoldReadContract({
    contractName: contractName,
    functionName: "getConfig",
    args: [challengeId],
  });

  const validatorHook = useScaffoldReadContract({
    contractName: contractName,
    functionName: "getValidationState",
    args: [challengeId],
  });

  const fetchValidationState = useCallback(async () => {
    try {
      const { data: validatorResponse } = await validatorHook.refetch();
      const contractState = validatorResponse === undefined ? "NOSTATE" : JSON.parse(validatorResponse)["state"];
      if (validationState !== contractState) {
        setValidationState(contractState);
      }
      return contractState;
    } catch (error) {
      console.error("Error fetching validation state:", error);
    }
  }, [validatorHook, validationState]);

  useEffect(() => {
    void fetchValidationState();
    // Ahora fetchValidationState es estable y no se redefinirá en cada render
  }, [fetchValidationState]);

  const handlePreValidation = async () => {
    if (validatorConfig !== undefined) {
      try {
        const configJson = JSON.parse(validatorConfig);
        const requiredPayment: bigint =
          configJson.requiredPaymentWei !== undefined ? BigInt(configJson.requiredPaymentWei) : 0n;
        await twoStepValidator({
          functionName: "preValidation",
          args: [challengeId, "0x"],
          value: requiredPayment,
        });
      } catch (error) {
        console.error("Error in pre validation step:", error);
        alert("Failed to pre validate. Please try again.");
      } finally {
      }
    }
  };

  const handleButtonClick = async () => {
    // Disable the button right away
    setButtonEnabled(false);
    setLoading(true);
    try {
      // Call pre-validation first
      let contractState = await fetchValidationState();

      if (contractState === "SUCCESS") {
        // If successful, there is not point in trying again.
        console.log("Validation successful. Reward already claimed.");
        setLoading(true);
        return;
      }

      console.log("Calling prevalidation. Current state: ", contractState);
      await handlePreValidation();

      let attempts = 0;
      let delay = backoffConfig.initialDelay;
      while (attempts < backoffConfig.maxAttempts) {
        // Wait for the current delay period
        await new Promise(resolve => setTimeout(resolve, delay));

        // Check current state
        contractState = await fetchValidationState();

        if (contractState === "SUCCESS") {
          // If successful, call claimReward and exit the loop.
          console.log("Validation successful. Claiming reward.");
          setLoading(true);
          return;
        }

        if (contractState === "FAIL") {
          // If it failed, re-enable the button and exit.
          setLoading(false);
          setButtonEnabled(true);
          return;
        }

        // Not in a terminal state yet; prepare for next attempt.
        attempts++;
        delay *= backoffConfig.factor;
      }

      // If we've reached the max attempts without a terminal state,
      // allow the user to try again.
      setLoading(false);
      setButtonEnabled(true);
    } catch (error) {
      console.error("Error during reward claiming process:", error);
      setLoading(false);
      setButtonEnabled(true);
    }
  };

  const badgeClass = stateStyles[validationState] || "bg-gray-200 text-gray-800";

  return (
    <div>
      <button
        className="btn btn-primary btn-sm"
        onClick={handleButtonClick}
        disabled={validationState === "SUCCESS" || loading || !buttonEnabled}
      >
        Claim Reward
      </button>
      {validationState !== "NOSTATE" && (
        <div
          className={`ml-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}
          title={stateDescriptions[validationState]}
        >
          {validationState}
        </div>
      )}
    </div>
  );
};

export default ClaimChallengeTwoStepButton;
