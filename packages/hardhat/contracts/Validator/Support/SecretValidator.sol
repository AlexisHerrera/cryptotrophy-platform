// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Groth16Verifier.sol";
import "../../Challenges/IValidator.sol";

contract SecretValidator is IValidator {
	string public description = "ZKP validator!";
	address public immutable groth16Addr;
	Groth16Verifier immutable verifier;

	mapping(address => uint256) public nonces; // Tracks user-specific nonces

	mapping(uint256 => mapping(uint256 => bool)) public config;
	// Array to store valid hashes for each validation ID (TODO: remove this, is just for debugging)
	mapping(uint256 => uint256[]) public validHashes;

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_challenge.ts
	constructor(address _groth16Addr) {
		groth16Addr = _groth16Addr;
		verifier = Groth16Verifier(_groth16Addr);
	}

	function setConfig(uint256 validationId, uint256 publicHash) public {
		config[validationId][publicHash] = true;
		validHashes[validationId].push(publicHash);
	}

	function getConfig(
		uint256 validationId
	) public pure returns (string memory) {
		return Strings.toString(validationId);
	}

	function validate(
		uint256 validationId,
		bytes calldata params
	) public view override returns (bool) {
		(
			uint[2] memory _pA,
			uint[2][2] memory _pB,
			uint[2] memory _pC,
			uint256 publicHash
		) = abi.decode(params, (uint[2], uint[2][2], uint[2], uint256));

		require(config[validationId][publicHash], "Invalid hash");

		return this.verifyProof(_pA, _pB, _pC, publicHash);
	}

	/// @notice Verify a proof
	/// @param a The first element of the proof
	/// @param b The second element of the proof
	/// @param c The third element of the proof
	/// @param publicHash The public hash to verify
	function verifyProof(
		uint[2] calldata a,
		uint[2][2] calldata b,
		uint[2] calldata c,
		uint256 publicHash
	) external view returns (bool) {
		uint256 userNonce = nonces[msg.sender];

		// Convert sender address to a field element
		uint256 senderAsField = uint256(uint160(msg.sender));

		// Verify proof (includes sender and userNonce)
		require(
			verifier.verifyProof(
				a,
				b,
				c,
				[senderAsField, userNonce, publicHash]
			),
			"Invalid proof"
		);
		return true;
	}

	/// @notice Add a list of hashes to the validator
	/// @param _hashes The list of hashes to add
	/// @dev This function is only callable by the owner of the validator
	function addValidHashes(
		uint256 validationId,
		uint256[] memory _hashes
	) public {
		for (uint256 i = 0; i < _hashes.length; i++) {
			setConfig(validationId, _hashes[i]);
		}
	}
}
