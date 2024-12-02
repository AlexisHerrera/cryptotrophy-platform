// types/snarkjs.d.ts
declare module "snarkjs" {
  export namespace groth16 {
    function fullProve(
      input: any,
      wasmFilePath: string,
      zkeyFilePath: string,
    ): Promise<{
      proof: Proof;
      publicSignals: string[];
    }>;

    function exportSolidityCallData(proof: Proof, publicSignals: string[]): Promise<string>;
  }

  interface Proof {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  }
}
