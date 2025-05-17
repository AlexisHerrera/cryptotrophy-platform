// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title MockFailingVerifier
 * @dev Mock implementation of Groth16Verifier for testing invalid proof scenarios.
 * Always returns false for verifyProof calls.
 */
contract MockFailingVerifier {
	// Simple mock that always returns false for any proof
	function verifyProof(
		uint[2] memory,
		uint[2][2] memory,
		uint[2] memory,
		uint[1] memory
	) public pure returns (bool) {
		// Mock implementation always returns false
		return false;
	}
}
