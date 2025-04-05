#!/bin/bash

# Store the root directory
ROOT_DIR=$(pwd)

# Create necessary directories
mkdir -p circuits/build

# Generate Powers of Tau
echo "Generating Powers of Tau..."
cd circuits/build
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
echo "test" | npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
npx snarkjs powersoftau prepare phase2 pot12_0001.ptau powersOfTau28_hez_final_10.ptau -v

echo "Powers of Tau generation complete!"