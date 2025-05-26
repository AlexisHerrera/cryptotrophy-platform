import { DECIMALS_TOKEN } from "~~/settings";

const formatToEth = (wei: string): string => {
  const weiValue = Number(wei);
  if (isNaN(weiValue)) return "";
  const ethAmount = weiValue / Math.pow(10, DECIMALS_TOKEN);
  return ethAmount > 0 && ethAmount < 0.0001 ? ethAmount.toExponential() : ethAmount.toFixed(4);
};

export default formatToEth;
