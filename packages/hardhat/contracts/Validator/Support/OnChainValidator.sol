// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Groth16Verifier.sol";
import "../../Challenges/IValidator.sol";

contract OnChainValidator is IValidator {
    string public description = "ZKP validator!";
    address public immutable groth16Addr;
    Groth16Verifier immutable verifier;

	mapping(address => uint256) public nonces; // Tracks user-specific nonces

    mapping(uint256 => uint256) public config;

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_challenge.ts
    constructor(address _groth16Addr) {
        groth16Addr = _groth16Addr;
        verifier = Groth16Verifier(_groth16Addr);
    }

    function setConfig(uint256 validationId, uint256 publicHash) public {
        config[validationId] = publicHash;
    }

    function getConfig(uint256 validationId) public view returns (string memory) {
        return string.concat("{\"public_hash\": \"", Strings.toString(config[validationId]), "\"}");
    }

    function validate(uint256 validationId, bytes calldata params) public view override returns (bool) {
        // Decode parameters specific to ValidatorA
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = abi.decode(
            params, (uint[2], uint[2][2], uint[2])
        );
       
	   	uint256 publicHash = config[validationId];
		require(publicHash != 0, "Invalid validationId");

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
		require(config[publicHash] != 0, "Invalid hash");

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
	function addValidHashes(uint256[] memory _hashes) public {
		for (uint256 i = 0; i < _hashes.length; i++) {
			// config[_hashes[i]] = _hashes[i];
			setConfig(_hashes[i], _hashes[i]);
		}
	}
}

