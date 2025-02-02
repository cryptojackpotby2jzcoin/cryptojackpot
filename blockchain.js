// Buffer hatasını önlemek için
if (typeof window.Buffer === "undefined") {
    window.Buffer = solanaWeb3.Buffer;
}

// Solana bağlantısı
const connection = new solanaWeb3.Connection("https://api.testnet.solana.com", "confirmed");

// 2JZ Coin mint adresi
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");

// House Wallet Public Key
const houseWalletPublicKey = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");

// Phantom Wallet bağlantısı
const wallet = window.solana;

// Wallet bağlantısı
async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("❌ Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return false;
    }

    try {
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${playerAddress}`;
        console.log("✅ Wallet bağlandı:", playerAddress);
        return true;
    } catch (error) {
        console.error("❌ Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlanırken bir hata oluştu.");
        return false;
    }
}

// Export işlemleri
window.connectWallet = connectWallet;
