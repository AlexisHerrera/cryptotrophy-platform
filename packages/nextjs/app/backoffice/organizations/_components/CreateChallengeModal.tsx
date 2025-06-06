"use client";

import React, { useState } from "react";
import { encodeBytes32String, parseUnits } from "ethers";
import ChallengeDetailsForm from "~~/app/backoffice/organizations/_components/pages/ChallengeDetails";
import SetChallengeValidator from "~~/app/backoffice/organizations/_components/pages/ChallengeValidator";
import ReviewChallengeData from "~~/app/backoffice/organizations/_components/pages/ReviewChallengeData";
import Modal from "~~/components/Modal";
import { useChallengeForm } from "~~/hooks/backoffice/useChallengeForm";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { getEncodedValidatorConfig, getValidatorAddress, getValidatorUID } from "~~/utils/challenges/challengeParam";

interface CreateChallengeModalProps {
  organizationId: bigint;
  onClose: () => void;
  challengeFormHook: ReturnType<typeof useChallengeForm>;
}

const CreateChallengeFlow: React.FC<CreateChallengeModalProps> = ({ organizationId, onClose, challengeFormHook }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { challengeForm, handleInputChange, setChallengeForm } = challengeFormHook;
  const { writeContractAsync: challengeManager } = useScaffoldWriteContract("ChallengeManager");
  const challengeManagerAddress = useDeployedContractInfo("ChallengeManager").data?.address;

  const handleChallengeSubmit = async () => {
    if (challengeForm.organizationId !== organizationId) {
      console.warn("Form organizationId mismatch. Syncing...");
      setChallengeForm(prev => ({ ...prev, organizationId: organizationId }));
    }
    try {
      setLoading(true);
      const { organizationId, description, prizeAmount, startTime, endTime, maxWinners, selectedValidator, params } =
        challengeForm;
      const prizeAmountInBaseUnits = parseUnits(prizeAmount.toString(), DECIMALS_TOKEN);
      const startTimestamp = BigInt(Math.floor(new Date(startTime).getTime() / 1000));
      const endTimestamp = BigInt(Math.floor(new Date(endTime).getTime() / 1000));
      const maxWinnersInt = BigInt(maxWinners);
      const validatorAddress = getValidatorAddress(selectedValidator, params);
      const validatorUID = getValidatorUID(selectedValidator, params);
      const encodedValidatorUID = encodeBytes32String(validatorUID) as `0x${string}`;
      const hexParams = await getEncodedValidatorConfig(selectedValidator, params, challengeManagerAddress);

      await challengeManager({
        functionName: "createChallengeWithValidator",
        args: [
          organizationId,
          description,
          prizeAmountInBaseUnits,
          startTimestamp,
          endTimestamp,
          maxWinnersInt,
          encodedValidatorUID,
          validatorAddress,
          hexParams,
        ],
      });
      onClose();
      challengeFormHook.resetChallengeForm(organizationId);
    } catch (error) {
      console.error("Error creating challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  const isCreateButtonDisabled =
    !challengeForm.maxPrizeAmount ||
    !challengeForm.prizeAmount ||
    !challengeForm.maxWinners ||
    parseUnits(challengeForm.prizeAmount.toString(), DECIMALS_TOKEN) > challengeForm.maxPrizeAmount;

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <Modal onClose={onClose}>
      <div className="p-1 bg-base-100 rounded-xl shadow-xl max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Create Your Challenge</h2>

        <ul className="steps steps-horizontal justify-center w-full mb-6 space-x-3">
          {["Challenge Data", "Validator", "Review"].map((label, index) => (
            <li
              key={index}
              className={`step cursor-pointer ${currentStep > index ? "step-primary" : ""}`}
              onClick={() => handleStepClick(index + 1)}
            >
              {label}
            </li>
          ))}
        </ul>

        {currentStep === 1 && <ChallengeDetailsForm formData={challengeForm} handleInputChange={handleInputChange} />}
        {currentStep === 2 && <SetChallengeValidator formData={challengeForm} handleInputChange={handleInputChange} />}
        {currentStep === 3 && <ReviewChallengeData formData={challengeForm} />}

        <div className="mt-2 flex justify-center gap-6">
          {currentStep > 1 && (
            <button className="btn btn-secondary" onClick={prevStep}>
              Previous
            </button>
          )}
          {currentStep < 3 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button
              className="btn btn-success ml-auto"
              onClick={handleChallengeSubmit}
              disabled={loading || isCreateButtonDisabled}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateChallengeFlow;
