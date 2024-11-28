"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Address } from "viem";
import AddressManager from "~~/app/create-organization/_components/AddressManager";

interface CreateOrganizationFormProps {
  organizationName: string;
  admins: Address[];
  users: Address[];
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
  const handleInputChange = (field: keyof CreateOrganizationFormProps, value: string | number) => {
    setOrganizationForm({ ...organizationForm, [field]: value });
  };

  console.log(organizationForm);
  return (
    <div className="p-8 bg-base-100 rounded-xl shadow-lg max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-500">Create Your New Organization</h2>
      <form>
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

        <button type="submit" className="btn btn-primary mt-4 w-full">
          Pay {organizationForm.ethBacking} ETH
        </button>
      </form>
    </div>
  );
};

export default CreateOrganizationForm;
