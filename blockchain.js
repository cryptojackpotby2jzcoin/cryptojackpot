// Buffer'ı doğrudan bir script etiketiyle import ediyoruz
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/buffer/5.7.1/buffer.min.js";
script.onload = () => {
    window.Buffer = Buffer;
};
document.head.appendChild(script);

// ✅ Solana bağlantısı (API Anahtarı ile)
const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");

// ✅ 2JZ Coin mint adresi
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");

// ✅ Kullanıcının 2JZ Coin bakiyesini sorgula
async function getUserBalance() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("❌ Wallet bağlı değil!");
        return;
    }

    try {
        // Doğrudan mint filtresi ile token hesaplarını çekiyoruz
        const accounts = await connection.getParsedTokenAccountsByOwner(
            window.solana.publicKey,
            { mint: tokenMintAddress }
        );

        let balance = 0;

        if (accounts.value.length > 0) {
            balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        }

        console.log(`🔄 Kullanıcının 2JZ Coin Bakiyesi: ${balance}`);
        return balance;

    } catch (error) {
        console.error("❌ Bakiye alınırken hata oluştu:", error);
        return 0;
    }
}

// Fonksiyonu global hale getiriyoruz
window.getUserBalance = getUserBalance;
