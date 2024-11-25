import React, { useState } from "react";
import { Address } from "viem";
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { BlockieAvatar } from "~~/components/scaffold-eth";

interface AddressInputProps {
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
}

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

const AddressManager = ({ addresses, setAddresses }: AddressInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsValid(isValidAddress(value));
  };

  const handleAddAddress = () => {
    if (isValid && !addresses.includes(inputValue as Address)) {
      setAddresses([...addresses, inputValue as Address]);
      setInputValue("");
      setIsValid(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter Ethereum Address"
          className={`w-full p-3 pr-10 border rounded-lg focus:outline-none ${
            isValid ? "border-green-500" : inputValue ? "border-red-500" : "border-gray-300"
          }`}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault(); // Evita el comportamiento predeterminado del Enter
              handleAddAddress();
            }
          }}
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
          {inputValue &&
            (isValid ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
            ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {addresses.map((address, index) => (
          <div key={index} className="flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-full shadow-sm">
            <BlockieAvatar address={address} size={20} />
            <span className="mr-2">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
            <button onClick={() => setAddresses(addresses.filter(item => item !== address))}>
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressManager;
