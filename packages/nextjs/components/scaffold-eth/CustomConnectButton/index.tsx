"use client";

import { useState } from "react";
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { Address } from "viem";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { wagmiConnectors } from "~~/services/web3/wagmiConnectors";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

export const CustomConnectButton = () => {
  const [selectedAccount, setSelectedAccount] = useState<"hunter" | "company" | null>(null);
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const chainId = useChainId(); // Hook para obtener el chainId actual
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  const handleConnect = (account: "hunter" | "company") => {
    setSelectedAccount(account);
    // Encuentra el conector adecuado en función del nombre de la cuenta
    const connector = wagmiConnectors.find(c =>
      account === "hunter" ? c === wagmiConnectors[0] : c === wagmiConnectors[1],
    );

    if (connector) {
      connect({ connector });
    } else {
      console.error("Conector no encontrado");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedAccount(null);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <button className="btn btn-primary btn-sm" onClick={() => handleConnect("hunter")}>
          Connect Hunter
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => handleConnect("company")}>
          Connect Company
        </button>
      </div>
    );
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, address as Address);

  return (
    <div className="flex items-center">
      {chainId !== targetNetwork.id ? ( // Verifica si la red es incorrecta
        <WrongNetworkDropdown />
      ) : (
        <>
          <div className="flex flex-col items-center mr-1">
            <Balance address={address as Address} className="min-h-0 h-auto" />
            <span className="text-xs" style={{ color: networkColor }}>
              {targetNetwork.name}
            </span>
          </div>
          <AddressInfoDropdown
            address={address as Address}
            displayName={selectedAccount ?? "Account"}
            ensAvatar={undefined}
            blockExplorerAddressLink={blockExplorerAddressLink}
          />
          <AddressQRCodeModal address={address as Address} modalId="qrcode-modal" />
          <button className="btn btn-secondary btn-sm ml-2" onClick={handleDisconnect}>
            Disconnect
          </button>
        </>
      )}
    </div>
  );
};
