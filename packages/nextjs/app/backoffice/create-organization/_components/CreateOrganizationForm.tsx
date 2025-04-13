"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Interface } from "ethers";
import { encodeBytes32String } from "ethers";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import StepCustomerBase from "~~/app/backoffice/create-organization/_components/steps/StepCustomerBase";
import StepEthereumBacking from "~~/app/backoffice/create-organization/_components/steps/StepEthereumBacking";
import StepOrganizationData from "~~/app/backoffice/create-organization/_components/steps/StepOrganizationData";
import StepReviewData from "~~/app/backoffice/create-organization/_components/steps/StepReviewData";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface CreateOrganizationFormProps {
  organizationName: string;
  admins: string[];
  customerBaseUID: string;
  tokenSymbol: string;
  initialMint: string;
  ethBacking: string;
}

const CreateOrganizationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationForm, setOrganizationForm] = useState<CreateOrganizationFormProps>({
    organizationName: "",
    admins: [],
    customerBaseUID: "",
    tokenSymbol: "",
    initialMint: "1000",
    ethBacking: "0",
  });
  const [loading, setLoading] = useState(false);

  const { address } = useAccount();
  const router = useRouter();

  const { data: result, writeContractAsync: createOrganization } = useScaffoldWriteContract("OrganizationManager");
  const { data: receipt } = useWaitForTransactionReceipt({ hash: result });

  useEffect(() => {
    const contractInterface = new Interface([
      "event OrganizationCreated(uint256 indexed orgId, string name, address token)",
    ]);
    if (receipt?.logs) {
      const log = receipt.logs.find(
        log => log.topics[0] === contractInterface.getEvent("OrganizationCreated")?.topicHash,
      );
      if (log) {
        const decodedLog = contractInterface.decodeEventLog("OrganizationCreated", log.data, log.topics);
        const organizationId = decodedLog.orgId;
        console.log("Organization ID:", organizationId.toString());
        // Redirigir a la página de la organización
        router.push(`/organizations/${organizationId.toString()}`);
      }
    }
  }, [receipt, router]);

  const handleInputChange = (field: keyof CreateOrganizationFormProps, value: string | string[]) => {
    setOrganizationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    const { organizationName, tokenSymbol, initialMint, ethBacking, admins, customerBaseUID } = organizationForm;

    if (!organizationName || !tokenSymbol) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const encodedCustomerBaseUID = encodeBytes32String(customerBaseUID);
      const tx = await createOrganization({
        functionName: "createOrganization",
        args: [
          organizationName,
          tokenSymbol,
          BigInt(initialMint),
          BigInt(ethBacking),
          admins,
          encodedCustomerBaseUID as `0x${string}`,
        ],
        value: BigInt(ethBacking),
      });

      if (!tx) {
        throw new Error("Failed to create organization.");
      }

      console.log("Transaction successful:", tx);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to create organization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-base-100 rounded-xl shadow-xl max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Create Your Organization</h2>

      <ul className="steps steps-horizontal mb-8 space-x-3">
        {["Organization Data", "Customer Base", "Ethereum Backing", "Review"].map((label, index) => (
          <li
            key={index}
            className={`step cursor-pointer ${currentStep > index ? "step-primary" : ""}`}
            onClick={() => handleStepClick(index + 1)}
          >
            {label}
          </li>
        ))}
      </ul>

      {currentStep === 1 && (
        <StepOrganizationData formData={organizationForm} handleInputChange={handleInputChange} address={address} />
      )}
      {currentStep === 2 && <StepCustomerBase formData={organizationForm} handleInputChange={handleInputChange} />}
      {currentStep === 3 && <StepEthereumBacking formData={organizationForm} handleInputChange={handleInputChange} />}
      {currentStep === 4 && <StepReviewData formData={organizationForm} />}

      <div className="mt-6 flex justify-center gap-6">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={prevStep}>
            Previous
          </button>
        )}
        {currentStep < 4 ? (
          <button className="btn btn-primary" onClick={nextStep}>
            Next
          </button>
        ) : (
          <button className="btn btn-success ml-auto" onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateOrganizationForm;
