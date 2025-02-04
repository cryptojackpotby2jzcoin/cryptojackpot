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
const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

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

// ✅ Get user balance from smart contract
async function getUserBalance() {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
        alert("❌ Wallet is not connected!");
        return 0;
    }

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
            provider.publicKey,
            { programId: TOKEN_PROGRAM_ID }
        );

        if (accounts.value.length > 0) {
            const balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            console.log(`🔄 Current balance: ${balance}`);
            return balance;
        } else {
            console.log("⚠️ No balance found!");
            return 0;
        }
    } catch (error) {
        console.error("❌ Error fetching balance:", error);
        return 0;
    }
}

// Make the functions global
window.initializeAccount = initializeAccount;
window.depositCoins = depositCoins;
window.spinGame = spinGame;
window.withdrawCoins = withdrawCoins;
window.getUserBalance = getUserBalance;

// Change all messages to English
window.alert = function(message) {
    const translations = {
        "❌ Wallet is not connected!": "❌ Wallet is not connected!",
        "✅ Account initialized successfully!": "✅ Account initialized successfully!",
        "💰 Coins withdrawn successfully!": "💰 Coins withdrawn successfully!",
        "❌ Error initializing account:": "❌ Error initializing account:",
        "❌ Error depositing coins:": "❌ Error depositing coins:",
        "🎰 Spin completed!": "🎰 Spin completed!",
        "❌ Error spinning game:": "❌ Error spinning game:",
        "❌ Error withdrawing coins:": "❌ Error withdrawing coins:",
        "❌ Error fetching balance:": "❌ Error fetching balance:",
        "⚠️ No balance found!": "⚠️ No balance found!",
    };
    console.log(translations[message] || message);
};
