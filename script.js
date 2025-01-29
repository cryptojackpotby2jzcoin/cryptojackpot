import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; 
const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF"; 

// Solana Pay üzerinden bağlantı sağlama
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            const walletAddress = response.publicKey.toString();
            document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
            console.log("✅ Wallet bağlandı:", walletAddress);
            return walletAddress;
        } catch (error) {
            console.error("❌ Wallet bağlantısı başarısız oldu:", error);
            alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            return null;
        }
    } else {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return null;
    }
}

// Solana Pay bağlantısı oluştur (Telegram uyumlu!)
function generateSolanaPayUrl(walletAddress, amount, label, message) {
    return `solana:${walletAddress}?amount=${amount}&token=${coinAddress}&label=${encodeURIComponent(label)}&message=${encodeURIComponent(message)}`;
}

// Telegram'da cüzdan bağlantısını taklit eden yapı
async function connectWalletViaSolanaPay() {
    try {
        const solanaPayUrl = generateSolanaPayUrl(houseWalletAddress, 0, "Connect Wallet", "Connect your Phantom Wallet");

        document.getElementById("wallet-address").innerHTML = `
            Wallet: Connecting... <br>
            <a href="${solanaPayUrl}" target="_blank">Phantom Wallet'ı Aç</a>
        `;

        console.log("🟡 Phantom Wallet açılıyor:", solanaPayUrl);
    } catch (error) {
        console.error("❌ Solana Pay bağlantısı başarısız oldu:", error);
        alert("Solana Pay bağlantısı başarısız oldu.");
    }
}

// **Connect Wallet butonuna basıldığında çalışacak**
document.getElementById("connect-wallet-button").addEventListener("click", async () => {
    const wallet = await connectWallet();
    if (!wallet) {
        console.log("Solana Pay ile bağlanmayı deniyoruz...");
        await connectWalletViaSolanaPay();
    }
});
