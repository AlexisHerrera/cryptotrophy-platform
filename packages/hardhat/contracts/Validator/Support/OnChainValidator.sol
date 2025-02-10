// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Groth16Verifier.sol";
import "../../Challenges/IValidator.sol";


contract OnChainValidator is IValidator {
    string public description = "ZKP validator!";
    address public immutable groth16Addr;
    Groth16Verifier immutable verifier;

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
        console.log("Calling validator from %s", msg.sender);
        console.log("_pA %i %i", _pA[0], _pA[1]);
        console.log("_pB0 %i %i", _pB[0][0], _pB[0][1]);
        console.log("_pB1 %i %i", _pB[1][0], _pB[1][1]);
        console.log("_pC %i %i", _pC[0], _pC[1]);
        console.log("_pubSignals %i", validationId);

        return verifier.verifyProof(_pA, _pB, _pC, [config[validationId]]);
    }
}

