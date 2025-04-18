export type ValidatorContractName =
  | "OnChainValidator"
  | "OffChainValidator"
  | "OffChainApiValidator"
  | "SecretValidator"
  | "RandomValidator";

export function getContractName(validatorUID: string) {
  const twoStepContractNameMap: Record<string, ValidatorContractName> = {
    OnChainValidatorV1: "OnChainValidator",
    OffChainValidatorV2: "OffChainApiValidator",
    OffChainValidatorV1: "OffChainValidator",
    SecretValidatorV1: "SecretValidator",
    RandomValidatorV1: "RandomValidator",
  };
  return twoStepContractNameMap[validatorUID];
}

export function getValidatorDisplayName(validatorUID: string): string {
  const validatorDisplayNames: Record<string, string> = {
    OnChainValidatorV1: "On Chain Validator",
    OffChainValidatorV2: "Off Chain Function",
    OffChainValidatorV1: "Off Chain Validator",
    SecretValidatorV1: "Secret Codes",
    RandomValidatorV1: "Random Validator",
  };

  return validatorUID ? validatorDisplayNames[validatorUID] || "Unknown Validator" : "No Validator";
}
