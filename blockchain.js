// Buffer'ı doğrudan bir script etiketiyle import ediyoruz
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/buffer/5.7.1/buffer.min.js";
script.onload = () => {
    window.Buffer = Buffer;
};
document.head.appendChild(script);

// ✅ Solana bağlantısı
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

// ✅ 2JZ Coin mint adresi
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");

// ✅ Kullanıcının 2JZ Coin bakiyesini sorgula
async function getUserBalance() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("❌ Wallet bağlı değil!");
        return;
    }

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
            window.solana.publicKey,
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

// Fonksiyonu global hale getiriyoruz
window.getUserBalance = getUserBalance;
