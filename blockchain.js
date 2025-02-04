// blockchain.js

// Buffer'ı doğrudan bir script etiketiyle import ediyoruz
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/buffer/5.7.1/buffer.min.js";
script.onload = () => {
    window.Buffer = Buffer;
};
document.head.appendChild(script);

// ✅ Solana bağlantısı (Alternatif RPC)
const connection = new solanaWeb3.Connection("https://rpc.ankr.com/solana", "confirmed");

// ✅ 2JZ Coin mint adresi
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");

// ✅ Kullanıcının 2JZ Coin bakiyesini sorgula
async function getUserBalance() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("❌ Wallet bağlı değil!");
        return;
    }

    try {
        // Tüm token hesaplarını çekiyoruz
        const accounts = await connection.getTokenAccountsByOwner(
            window.solana.publicKey,
            { programId: new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") } // SPL Token Program ID
        );

        let balance = 0;

        // 2JZ Coin mint adresine sahip olan hesabı bulup bakiyeyi alıyoruz
        for (let accountInfo of accounts.value) {
            const accountData = await connection.getParsedAccountInfo(accountInfo.pubkey);
            const tokenInfo = accountData.value.data.parsed.info;

            if (tokenInfo.mint === tokenMintAddress.toString()) {
                balance = tokenInfo.tokenAmount.uiAmount;
                break;
            }
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
