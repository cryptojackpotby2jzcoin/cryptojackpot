const wallet = window.solana;

import { Buffer } from "buffer";
window.Buffer = Buffer;

// ✅ Solana bağlantısı (Yeni RPC sağlayıcısı ile güncellendi)
const connection = new solanaWeb3.Connection("https://rpc.helius.xyz", "confirmed");

// ✅ 2JZ Coin mint adresi
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");

const houseWalletPublicKey = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");

// ✅ Phantom Wallet bağlantısı
const wallet = window.solana;

// ✅ Kullanıcının 2JZ Coin bakiyesini sorgula
async function getUserBalance() {
    if (!wallet || !wallet.isPhantom) {
        alert("❌ Wallet bağlı değil!");
        return;
    }

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
            wallet.publicKey,
            { mint: tokenMintAddress }
        );

        if (accounts.value.length > 0) {
            let balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            console.log(`🔄 Kullanıcının 2JZ Coin Bakiyesi: ${balance}`);
            return balance;
        } else {
            console.log("⚠️ Kullanıcının bakiyesi yok!");
            return 0;
        }
    } catch (error) {
        console.error("❌ Bakiye alınırken hata oluştu:", error);
        return 0;
    }
}

// Export olmadan çalışacak şekilde ayarladık
window.getUserBalance = getUserBalance;
