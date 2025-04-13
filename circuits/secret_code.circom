pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";


template SecretCode() {
    signal input secret;       // User's secret code (hidden)
    signal input publicHash;   // Public hash stored on-chain

    // Create Poseidon component
    component hasher = Poseidon(1);

    // Ensure the secret is correct
    hasher.inputs[0] <== secret;
    signal secretHash <== hasher.out;
    secretHash === publicHash;   // Enforce knowledge of the secret
}

component main {public [publicHash]} = SecretCode();
