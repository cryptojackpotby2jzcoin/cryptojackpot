// blockchain.js

// Solana bağlantısı (Helius API ile)
const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// ✅ Kullanıcının bakiyesini blockchain üzerinden al
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

// ✅ Oyunu döndürme (spin) işlemi
async function spinGame() {
    console.log("🎰 Spin initiated!");
}

// Fonksiyonları global hale getir
window.getUserBalance = getUserBalance;
window.spinGame = spinGame;
