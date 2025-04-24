"use client";

import React, { useState } from "react";
import { encodeBytes32String, parseUnits } from "ethers";
import ChallengeDetailsForm from "~~/app/backoffice/organizations/_components/pages/ChallengeDetails";
import SetChallengeValidator from "~~/app/backoffice/organizations/_components/pages/ChallengeValidator";
import ReviewChallengeData from "~~/app/backoffice/organizations/_components/pages/ReviewChallengeData";
import Modal from "~~/components/Modal";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { ChallengeData, getEncodedValidatorConfig } from "~~/utils/challenges/challengeParam";

interface CreateChallengeModalProps {
  organizationId: bigint;
  onClose: () => void;
}

const CreateChallengeForm: React.FC<CreateChallengeModalProps> = ({ organizationId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultStartTime = now.toISOString().slice(0, 16);
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const defaultEndTime = oneWeekLater.toISOString().slice(0, 16);

  const [challengeForm, setChallengeForm] = useState<ChallengeData>({
    organizationId: organizationId,
    description: "",
    prizeAmount: 0,
    maxPrizeAmount: 0n,
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    maxWinners: 1,
    validatorUID: "",
    validatorAddress: "0x0000000000000000000000000000000000000000",
    params: {},
  });

  const { writeContractAsync: challengeManager } = useScaffoldWriteContract("ChallengeManager");
  const challengeManagerAddress = useDeployedContractInfo("ChallengeManager").data?.address;

  const handleChallengeSubmit = async () => {
    try {
      setLoading(true);
      const {
        organizationId,
        description,
        prizeAmount,
        startTime,
        endTime,
        maxWinners,
        validatorUID,
        validatorAddress,
        params,
      } = challengeForm;
      const prizeAmountInBaseUnits = parseUnits(prizeAmount.toString(), DECIMALS_TOKEN);
      const startTimestamp = BigInt(Math.floor(new Date(startTime).getTime() / 1000));
      const endTimestamp = BigInt(Math.floor(new Date(endTime).getTime() / 1000));
      const maxWinnersInt = BigInt(maxWinners);
      const encodedValidatorUID = encodeBytes32String(validatorUID) as `0x${string}`;
      const hexParams = await getEncodedValidatorConfig(validatorUID, params, challengeManagerAddress);

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
      alert("Challenge created successfully!");
      onClose();
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

  const handleInputChange = (field: keyof ChallengeData, value: string | bigint | Record<string, any>) => {
    setChallengeForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <Modal onClose={onClose}>
      <div className="p-8 bg-base-100 rounded-xl shadow-xl max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Create Your Challenge</h2>

        <ul className="steps steps-horizontal mb-8 space-x-3">
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

        <div className="mt-6 flex justify-center gap-6">
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

export default CreateChallengeForm;
