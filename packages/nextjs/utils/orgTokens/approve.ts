import { ethers } from "ethers";

/**
 * checkAndApproveErc20:
 *  - Lee el allowance del usuario hacia `spenderAddress`.
 *  - Si allowance < neededAmount, emite una transacción de approve.
 *  - Retorna true si allowance >= neededAmount (sea de antes o tras approve).
 *  - Retorna false si falla o el usuario rechaza la transacción.
 *
 * @param tokenAddress   dirección del token ERC20
 * @param spenderAddress dirección del contrato que hará el transferFrom (por ej. Prizes)
 * @param neededAmount   cantidad que necesitamos aprobar (en wei, BigInt)
 * @param userAddress    dirección del usuario (owner)
 * @param signer         instancia de ethers.Signer
 * @returns boolean
 */
export async function checkAndApproveErc20(
  tokenAddress: string,
  spenderAddress: string,
  neededAmount: bigint,
  userAddress: string,
  signer: ethers.Signer | undefined,
): Promise<boolean> {
  if (!tokenAddress || !spenderAddress || neededAmount <= 0n || !userAddress || !signer) {
    console.error("Invalid params in checkAndApproveErc20:", {
      tokenAddress,
      spenderAddress,
      neededAmount,
      userAddress,
    });
    return false;
  }

  try {
    const erc20Abi = [
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) public returns (bool)",
    ];
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);

    const currentAllowance: bigint = await tokenContract.allowance(userAddress, spenderAddress);

    console.log(`checkAndApproveErc20: currentAllowance= ${currentAllowance.toString()}`);

    if (currentAllowance >= neededAmount) {
      return true;
    }
    console.log(`Allowance < needed. Approving ${neededAmount.toString()}...`);
    const tx = await tokenContract.approve(spenderAddress, neededAmount);
    await tx.wait();

    const newAllowance: bigint = await tokenContract.allowance(userAddress, spenderAddress);
    console.log(`New allowance= ${newAllowance.toString()}`);

    return newAllowance >= neededAmount;
  } catch (error) {
    console.error("Error in checkAndApproveErc20:", error);
    return false;
  }
}
