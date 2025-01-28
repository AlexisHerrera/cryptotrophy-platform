"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Interface } from "ethers";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import Step1OrganizationData from "~~/app/create-organization/_components/steps/Step1OrganizationData";
import Step2EthereumBacking from "~~/app/create-organization/_components/steps/Step2EthereumBacking";
import Step3ReviewData from "~~/app/create-organization/_components/steps/Step3ReviewData";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface CreateOrganizationFormProps {
  organizationName: string;
  admins: string[];
  users: string[];
  tokenSymbol: string;
  initialMint: string;
  ethBacking: string;
}

const CreateOrganizationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationForm, setOrganizationForm] = useState<CreateOrganizationFormProps>({
    organizationName: "",
    admins: [],
    users: [],
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    const { organizationName, tokenSymbol, initialMint, ethBacking, admins, users } = organizationForm;

    if (!organizationName || !tokenSymbol) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const tx = await createOrganization({
        functionName: "createOrganization",
        args: [organizationName, tokenSymbol, BigInt(initialMint), BigInt(ethBacking), admins, users],
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
        {["Organization Data", "Ethereum Backing", "Review"].map((label, index) => (
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
        <Step1OrganizationData formData={organizationForm} handleInputChange={handleInputChange} address={address} />
      )}
      {currentStep === 2 && <Step2EthereumBacking formData={organizationForm} handleInputChange={handleInputChange} />}
      {currentStep === 3 && <Step3ReviewData formData={organizationForm} />}

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
          <button className="btn btn-success ml-auto" onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateOrganizationForm;
