// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title MockGroth16Verifier
 * @dev Mock implementation of Groth16Verifier for testing purposes.
 * Always returns true for verifyProof calls.
 */
contract MockGroth16Verifier {
	// Simple mock that always returns true for any proof
	function verifyProof(
		uint[2] memory,
		uint[2][2] memory,
		uint[2] memory,
		uint[1] memory
	) public pure returns (bool) {
		// Mock implementation always returns true regardless of input
		return true;
	}
}
