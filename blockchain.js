const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// ✅ Get user balance from blockchain
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

// ✅ Spin the game (placeholder for smart contract interaction)
async function spinGame() {
    console.log("🎰 Spin initiated!");
    // Smart contract spin logic to be integrated here
}

// Fonksiyonları global hale getir
window.getUserBalance = getUserBalance;
window.spinGame = spinGame;
