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

	// Store used hashes for each validation ID
	mapping(uint256 => mapping(uint256 => bool)) public usedHashes;

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_challenge.ts
	constructor(address _groth16Addr) {
		groth16Addr = _groth16Addr;
		verifier = Groth16Verifier(_groth16Addr);
	}

	function setConfigFromParams(
		uint256 _validationId,
		bytes calldata _params
	) public {
		(uint256 length, uint256[] memory _hashes) = abi.decode(
			_params,
			(uint256, uint256[])
		);
		for (uint256 i = 0; i < length; i++) {
			uint256 _publicHash = _hashes[i];
			config[_validationId][_publicHash] = true;
		}
	}

	/// @notice Add a list of hashes to the validator
	/// @param _hashes The list of hashes to add
	/// @dev This function is only callable by the owner of the validator
	function setConfig(
		uint256 validationId,
		uint256[] calldata _hashes
	) public {
		for (uint256 i = 0; i < _hashes.length; i++) {
			uint256 _publicHash = _hashes[i];
			config[validationId][_publicHash] = true;
		}
	}

	function getConfig(
		uint256 validationId
	) public pure returns (string memory) {
		return Strings.toString(validationId);
	}

	function decodeParams(
		bytes calldata params
	)
		public
		pure
		returns (
			uint[2] memory _pA,
			uint[2][2] memory _pB,
			uint[2] memory _pC,
			uint256 publicHash
		)
	{
		(_pA, _pB, _pC, publicHash) = abi.decode(
			params,
			(uint[2], uint[2][2], uint[2], uint256)
		);
	}

	function getPublicSignals(
		uint256 publicHash
	) public view returns (uint256, uint256, uint256) {
		return (uint256(uint160(msg.sender)), nonces[msg.sender], publicHash);
	}

	function getAddressAsField(address sender) public pure returns (uint256) {
		return uint256(uint160(sender));
	}

	function validate(
		uint256 validationId,
		bytes calldata params
	) public override returns (bool) {
		(
			uint[2] memory _pA,
			uint[2][2] memory _pB,
			uint[2] memory _pC,
			uint256 publicHash
		) = abi.decode(params, (uint[2], uint[2][2], uint[2], uint256));

		require(config[validationId][publicHash], "Invalid hash");
		require(!usedHashes[validationId][publicHash], "Hash already used");
		usedHashes[validationId][publicHash] = true;

		require(
			verifier.verifyProof(_pA, _pB, _pC, [publicHash]),
			"Invalid proof"
		);
		return true;
	}
}
