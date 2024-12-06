// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/


pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Groth16Verifier.sol";

interface IValidator {
    function validate(uint256 validationId, bytes calldata params) external returns (bool);
    function getConfig(uint256 validationId) external view returns (string memory);
}

contract OnChainValidator is IValidator {
    string public description = "ZKP validator!";
    address public immutable groth16Addr;
    Groth16Verifier immutable verifier;

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_challenge.ts
    constructor(address _groth16Addr) {
        groth16Addr = _groth16Addr;
        verifier = Groth16Verifier(_groth16Addr);
    }

    function getConfig(uint256 validationId) public pure override returns (string memory) {
        return string.concat("{\"public_hash\": \"", Strings.toString(validationId), "\"}");
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

        return verifier.verifyProof(_pA, _pB, _pC, [validationId]);
    }
 }

