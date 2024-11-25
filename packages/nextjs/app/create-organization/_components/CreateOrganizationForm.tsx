"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Address } from "viem";
import AddressManager from "~~/app/create-organization/_components/AddressManager";
import { BlockieAvatar } from "~~/components/scaffold-eth";

const CreateOrganizationForm = () => {
  const tokens = [
    { name: "CryptoTrophy", logo: "/trophy.png", address: "0x0001...abcd" },
    { name: "TokenGold", logo: "/gold.png", address: "0x0002...efgh" },
    { name: "SilverCoin", logo: "/silver.png", address: "0x0003...ijkl" },
  ];
  const [selectedAdmins, setSelectedAdmins] = useState<Address[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Address[]>([]);
  const [selectedToken, setSelectedToken] = useState(tokens[2]);
  const [initialMint, setInitialMint] = useState<number>(1000);
  const [assets, setAssets] = useState<number>(1);
  const [commission, setCommission] = useState<number>(0.05); // 5% commission
  const [gasFees, setGasFees] = useState<number>(0.01); // 0.01 ETH

  const totalAmount = assets + gasFees + assets * commission;

  const toggleSelection = (
    address: string,
    selectionList: string[],
    setSelection: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (selectionList.includes(address)) {
      setSelection(selectionList.filter(addr => addr !== address));
    } else {
      setSelection([...selectionList, address]);
    }
  };

  return (
    <div className="p-8 bg-base-100 rounded-xl shadow-lg max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-500">Create Your New Organization</h2>
      <form>
        <div className="form-control mb-4">
          <label className="label text-lg">Organization Name:</label>
          <input type="text" placeholder="Enter organization name" className="input input-bordered" />
        </div>
        <div className="form-control mb-4">
          <label className="label text-lg">Add Admins:</label>
          <AddressManager addresses={selectedAdmins} setAddresses={setSelectedAdmins} />
        </div>

        <div className="form-control mb-4">
          <label className="label text-lg">Add Users:</label>
          <AddressManager addresses={selectedUsers} setAddresses={setSelectedUsers} />
        </div>
        <div className="form-control mb-4">
          <label className="label text-lg">Token Address:</label>
          <div className="relative">
            <button className="input input-bordered w-full text-left flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src={selectedToken.logo} alt={`${selectedToken.name} logo`} width={20} height={20} />
                <span>{`${selectedToken.name} - ${selectedToken.address}`}</span>
              </div>
              <span className="caret"></span>
            </button>
          </div>
        </div>

        {/* Initial Mint */}
        <div className="form-control mb-4">
          <label className="label text-lg">Initial Mint:</label>
          <input
            type="number"
            value={initialMint}
            onChange={e => setInitialMint(parseFloat(e.target.value) || 0)}
            className="input input-bordered"
          />
        </div>

        {/* Assets */}
        <div className="form-control mb-4">
          <label className="label text-lg">Assets (ETH):</label>
          <input
            type="number"
            value={assets}
            onChange={e => setAssets(parseFloat(e.target.value) || 0)}
            className="input input-bordered"
          />
        </div>

        <button type="submit" className="btn btn-primary mt-4 w-full">
          Pay {totalAmount.toFixed(2)} ETH
        </button>
      </form>
    </div>
  );
};

export default CreateOrganizationForm;
