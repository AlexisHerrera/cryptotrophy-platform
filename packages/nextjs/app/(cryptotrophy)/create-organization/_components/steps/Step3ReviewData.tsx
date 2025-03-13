import React from "react";
import { useAccount } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";

interface Step3ReviewDataProps {
  formData: {
    organizationName: string;
    admins: string[];
    users: string[];
    tokenSymbol: string;
    initialMint: string;
    ethBacking: string;
  };
}

export const formatEthBacking = (value: string): string => {
  const ethValue = parseFloat((parseInt(value || "0", 10) / 1e18).toFixed(6)); // Convertir wei a ETH
  return ethValue >= 0.001 ? `${ethValue} ETH` : `${value} wei`;
};

const Step3ReviewData: React.FC<Step3ReviewDataProps> = ({ formData }) => {
  const { address } = useAccount();
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Review Your Data</h3>

      <div>
        <strong>Organization Name:</strong> {formData.organizationName}
      </div>

      <div>
        <strong>Admins:</strong>
        <div className="flex flex-wrap gap-2 mt-2">
          {address && (
            <div className="flex items-center gap-2 p-2 rounded-lg shadow border">
              <BlockieAvatar address={address} size={32} />
              <span className="text-sm">{`${address.slice(0, 6)}...${address.slice(-4)} (You)`}</span>
            </div>
          )}
          {formData.admins.map((admin, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded-lg shadow border">
              <BlockieAvatar address={admin} size={32} />
              <span className="text-sm">{`${admin.slice(0, 6)}...${admin.slice(-4)}`}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <strong>Users:</strong>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.users.map((user, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg shadow">
              <BlockieAvatar address={user} size={32} />
              <span className="text-sm">{`${user.slice(0, 6)}...${user.slice(-4)}`}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <strong>Token Symbol:</strong> {formData.tokenSymbol}
      </div>

      <div>
        <strong>Initial Mint:</strong> {formData.initialMint} {formData.tokenSymbol}
      </div>

      <div>
        <strong>ETH Backing:</strong> {formatEthBacking(formData.ethBacking)}
      </div>
    </div>
  );
};

export default Step3ReviewData;
