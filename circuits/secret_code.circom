pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";


template SecretCode() {
    signal input secret;       // User's secret code (hidden)
    signal input sender;       // Sender's Ethereum address (public)
    signal input nonce;        // User-specific sequential nonce
    signal input publicHash;   // Public hash stored on-chain

    // Create Poseidon components
    component hasher1 = Poseidon(1);
    component hasher2 = Poseidon(3);

    // Ensure the secret is correct
    hasher1.inputs[0] <== secret;
    signal secretHash <== hasher1.out;
    secretHash === publicHash;   // Enforce knowledge of the secret

    // Generate a unique nullifier: hash(secret, nonce, sender)
    hasher2.inputs[0] <== secret;
    hasher2.inputs[1] <== nonce;
    hasher2.inputs[2] <== sender;
}

component main {public [sender, nonce, publicHash]} = SecretCode(); 