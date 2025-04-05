#!/bin/bash

# Store the root directory
ROOT_DIR=$(pwd)

# Check if Powers of Tau file exists
if [ ! -f "circuits/build/powersOfTau28_hez_final_10.ptau" ]; then
    echo "Powers of Tau file not found. Please run generate-powers-of-tau.sh first"
    exit 1
fi

# Create necessary directories
mkdir -p circuits/build

# Compile the circuit
echo "Compiling circuit..."
npx circom circuits/secret_code.circom --r1cs --wasm --sym --c -l node_modules --output circuits/build

# Generate zkey files
echo "Generating proving key..."
cd circuits/build
npx snarkjs groth16 setup secret_code.r1cs powersOfTau28_hez_final_10.ptau secret_code_0000.zkey

echo "Contributing to phase 2 ceremony..."
echo "test" | npx snarkjs zkey contribute secret_code_0000.zkey secret_code_final.zkey

echo "Exporting verification key..."
npx snarkjs zkey export verificationkey secret_code_final.zkey verification_key.json

echo "Generating Solidity verifier..."
npx snarkjs zkey export solidityverifier secret_code_final.zkey Groth16Verifier.sol

# Move the verifier contract to the hardhat contracts directory
mkdir -p ../../packages/hardhat/contracts
cp Groth16Verifier.sol ../../packages/hardhat/contracts/

echo "Circuit compilation and setup complete!" 