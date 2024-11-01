import { mock } from "@wagmi/core";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const getBurnerPrivateKey = (accountName: "hunter" | "company"): Hex => {
  const keys = {
    hunter: "0x4cd845aa34dd31890f2be6e79768a98aa92920942111d20ce09f86fe5699ac36" as Hex,
    company: "0x49c92ca9a5b7c93846612115e270ca4c576eb9c3078510e5ca707343b0779618" as Hex,
  };
  return keys[accountName] || generatePrivateKey();
};

const hunterAccount = privateKeyToAccount(getBurnerPrivateKey("hunter"));
const companyAccount = privateKeyToAccount(getBurnerPrivateKey("company"));

const hunterConnector = mock({
  accounts: [hunterAccount.address],
});

const companyConnector = mock({
  accounts: [companyAccount.address],
});

export const wagmiConnectors = [hunterConnector, companyConnector];
