import { solidityPacked, keccak256, toBigInt } from "ethers";

const msgSender = "0x6875548D549dB2D6D99B29E0BA6ea7f7C53739D1";

const packed = solidityPacked(["address"], [msgSender]);

const hash = keccak256(packed);

const uint256 = toBigInt(hash);

console.log("Packed (hex):", packed);
console.log("Keccak256 hash:", hash);
console.log("As uint256 (decimal):", uint256.toString());
