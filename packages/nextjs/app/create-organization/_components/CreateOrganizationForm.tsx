"use client";

import React, { useState } from "react";
import { parseEther } from "ethers";
import AddressManager from "~~/app/create-organization/_components/AddressManager";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CreateOrganizationFormProps {
  organizationName: string;
  admins: string[];
  users: string[];
  tokenSymbol: string;
  initialMint: number;
  ethBacking: number;
}

const CreateOrganizationForm = () => {
  const [organizationForm, setOrganizationForm] = useState<CreateOrganizationFormProps>({
    organizationName: "",
    admins: [],
    users: [],
    tokenSymbol: "",
    initialMint: 1000,
    ethBacking: 0,
  });
  const [loading, setLoading] = useState(false);

  const { writeContractAsync: createOrganization } = useScaffoldWriteContract("CryptoTrophyPlatform");

  const handleInputChange = (field: keyof CreateOrganizationFormProps, value: string | number) => {
    setOrganizationForm({ ...organizationForm, [field]: value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { organizationName, tokenSymbol, initialMint, ethBacking, admins, users } = organizationForm;

    if (!organizationName || !tokenSymbol || admins.length === 0 || users.length === 0 || ethBacking <= 0) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const tx = await createOrganization({
        functionName: "createOrganization",
        args: [organizationName, tokenSymbol, BigInt(initialMint), parseEther(ethBacking.toString()), admins, users],
        value: parseEther(ethBacking.toString()),
      });
      if (!tx) {
        throw new Error("Failed to create organization.");
      }
      console.log("Organization created successfully:", tx);
      setOrganizationForm({
        organizationName: "",
        admins: [],
        users: [],
        tokenSymbol: "",
        initialMint: 1000,
        ethBacking: 0,
      });
    } catch (error: any) {
      console.error("Error creating organization:", error);
      alert(error.message || "Failed to create organization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-base-100 rounded-xl shadow-lg max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-500">Create Your New Organization</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-control mb-4">
          <label className="label text-lg">Organization Name:</label>
          <input
            type="text"
            placeholder="Enter organization name"
            className="input input-bordered"
            value={organizationForm.organizationName}
            onChange={e => handleInputChange("organizationName", e.target.value)}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label text-lg">Add Admins:</label>
          <AddressManager
            addresses={organizationForm.admins}
            setAddresses={admins => setOrganizationForm({ ...organizationForm, admins })}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label text-lg">Add Users:</label>
          <AddressManager
            addresses={organizationForm.users}
            setAddresses={users => setOrganizationForm({ ...organizationForm, users })}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label text-lg">Token Symbol:</label>
          <input
            type="text"
            placeholder="Enter token symbol"
            className="input input-bordered"
            value={organizationForm.tokenSymbol}
            onChange={e => handleInputChange("tokenSymbol", e.target.value)}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label text-lg">Initial Mint:</label>
          <input
            type="number"
            placeholder="Enter initial mint"
            className="input input-bordered"
            value={organizationForm.initialMint}
            onChange={e => handleInputChange("initialMint", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label text-lg">ETH Backing:</label>
          <input
            type="number"
            placeholder="Enter ETH backing amount"
            className="input input-bordered"
            value={organizationForm.ethBacking}
            onChange={e => handleInputChange("ethBacking", parseFloat(e.target.value) || 0)}
          />
        </div>

        <button type="submit" className="btn btn-primary mt-4 w-full" disabled={loading}>
          {loading ? "Processing..." : `Pay ${organizationForm.ethBacking} ETH`}
        </button>
      </form>
    </div>
  );
};

export default CreateOrganizationForm;
