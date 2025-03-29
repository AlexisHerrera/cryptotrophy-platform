import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";

interface UserBalanceProps {
  orgId: bigint;
}

const UserBalance: React.FC<UserBalanceProps> = ({ orgId }) => {
  const { address } = useAccount();

  const { data: balanceData, isLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getBalanceOfUser",
    args: [orgId, address],
  });

  if (isLoading) {
    return <span className="loading loading-spinner loading-xs"></span>;
  }

  if (!balanceData) {
    return <span>-</span>;
  }

  const [balance, symbol] = balanceData;
  return (
    <span>
      {ethers.formatUnits(balance, DECIMALS_TOKEN)} {symbol}
    </span>
  );
};

export default UserBalance;
