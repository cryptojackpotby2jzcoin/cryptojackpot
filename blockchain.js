// blockchain.js

// Import Buffer directly with a script tag
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/buffer/5.7.1/buffer.min.js";
script.onload = () => {
    window.Buffer = Buffer;
};
document.head.appendChild(script);

// ✅ Solana connection using Helius API Key
const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");

// ✅ 2JZ Coin smart contract program ID
const programId = new solanaWeb3.PublicKey("7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv");

// ✅ Initialize user account in smart contract
async function initializeAccount() {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
        alert("❌ Wallet is not connected!");
        return;
    }

    const transaction = new solanaWeb3.Transaction().add(
        new solanaWeb3.TransactionInstruction({
            keys: [{ pubkey: provider.publicKey, isSigner: true, isWritable: true }],
            programId: programId,
            data: new Uint8Array([0]) // Initialize instruction identifier
        })
    );

    try {
        const signature = await provider.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
        console.log("✅ Account initialized successfully!");
    } catch (error) {
        console.error("❌ Error initializing account:", error);
    }
}

// ✅ Deposit coins to smart contract
async function depositCoins(amount) {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
        alert("❌ Wallet is not connected!");
        return;
    }

    const transaction = new solanaWeb3.Transaction().add(
        new solanaWeb3.TransactionInstruction({
            keys: [{ pubkey: provider.publicKey, isSigner: true, isWritable: true }],
            programId: programId,
            data: new Uint8Array([1, ...new BN(amount).toArray('le', 8)]) // Deposit instruction identifier and amount
        })
    );

    try {
        const signature = await provider.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
        console.log(`💰 ${amount} coins deposited successfully!`);
    } catch (error) {
        console.error("❌ Error depositing coins:", error);
    }
}

// ✅ Spin the game using smart contract
async function spinGame() {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
        alert("❌ Wallet is not connected!");
        return;
    }

    const transaction = new solanaWeb3.Transaction().add(
        new solanaWeb3.TransactionInstruction({
            keys: [{ pubkey: provider.publicKey, isSigner: true, isWritable: true }],
            programId: programId,
            data: new Uint8Array([2]) // Spin instruction identifier
        })
    );

    try {
        const signature = await provider.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
        console.log("🎰 Spin completed!");
    } catch (error) {
        console.error("❌ Error spinning game:", error);
    }
}

// ✅ Withdraw coins from smart contract
async function withdrawCoins() {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
        alert("❌ Wallet is not connected!");
        return;
    }

    const transaction = new solanaWeb3.Transaction().add(
        new solanaWeb3.TransactionInstruction({
            keys: [{ pubkey: provider.publicKey, isSigner: true, isWritable: true }],
            programId: programId,
            data: new Uint8Array([3]) // Withdraw instruction identifier
        })
    );

    try {
        const signature = await provider.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
        console.log("💰 Coins withdrawn successfully!");
    } catch (error) {
        console.error("❌ Error withdrawing coins:", error);
    }
}

// Make the functions global
window.initializeAccount = initializeAccount;
window.depositCoins = depositCoins;
window.spinGame = spinGame;
window.withdrawCoins = withdrawCoins;
