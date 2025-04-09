export type ValidatorContractName =
  | "OnChainValidator"
  | "OffChainValidator"
  | "OffChainApiValidator"
  | "RandomValidator";

export function getContractName(validatorUID: string) {
  const twoStepContractNameMap: Record<string, ValidatorContractName> = {
    OnChainValidatorV1: "OnChainValidator",
    OffChainValidatorV2: "OffChainApiValidator",
    OffChainValidatorV1: "OffChainValidator",
    RandomValidatorV1: "RandomValidator",
  };
  return twoStepContractNameMap[validatorUID];
}
