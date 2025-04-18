# How to Generate Files from a Circom Circuit

This guide explains how to generate the following files from a Circom circuit (e.g., `secret_code.circom`):

- `secret_code.wasm`
- `secret_code.zkey`
- `verification_key.json`
- `Groth16Verifier.sol`

---

## 1. Compile the Circuit
Compile your `.circom` file to generate the `.wasm` and `.r1cs` files:

```bash
circom secret_code.circom --r1cs --wasm --sym
```

This command outputs:
- `secret_code.r1cs`
- `secret_code.wasm`
- `secret_code.sym`
- Directory: `secret_code_js/` (contains the WebAssembly and JavaScript wrapper)

---

## 2. Setup the Trusted Ceremony (Powers of Tau)
You need a Powers of Tau file for the next step. Instead of generating your own, you can download a trusted one from the [SnarkJS GitHub repository](https://github.com/iden3/snarkjs?tab=readme-ov-file).

For example, download `pot14_final.ptau` and continue with:

---

## 3. Generate the zKey File
Create the proving and verifying keys:

```bash
snarkjs groth16 setup secret_code.r1cs pot14_final.ptau secret_code_0000.zkey
snarkjs zkey contribute secret_code_0000.zkey secret_code.zkey --name="1st Contributor"
```

---

## 4. Export the Verification Key
Generate the verification key from the `.zkey` file:

```bash
snarkjs zkey export verificationkey secret_code.zkey verification_key.json
```

---

## 5. Generate the Solidity Verifier Contract
Export a Solidity smart contract verifier:

```bash
snarkjs zkey export solidityverifier secret_code.zkey Groth16Verifier.sol
```

---

## (Optional) Generate and Verify a Proof
You can test the proof system with sample inputs:

```bash
# Generate witness
node secret_code_js/generate_witness.js secret_code_js/secret_code.wasm input.json witness.wtns

# Generate proof
snarkjs groth16 prove secret_code.zkey witness.wtns proof.json public.json

# Verify the proof
snarkjs groth16 verify verification_key.json public.json proof.json
```
