import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
const wallet = window.solana;

// Cüzdan Bağlantısı
async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return false;
    }

    try {
        const response = await wallet.connect();
        const walletAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
        return walletAddress;
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlantısı başarısız. Lütfen tekrar deneyin.");
        return false;
    }
}

// Spin Ödülü Transferi (Mock Fonksiyon - Gerçek Transfer İçin Geliştirme Gerekebilir)
async function transferSpinReward(walletAddress, rewardAmount) {
    try {
        console.log(`Transferring ${rewardAmount} coins to ${walletAddress}`);
        // Placeholder for real transaction
        alert(`🎉 ${rewardAmount} coin gönderildi!`);
    } catch (error) {
        console.error("Ödül transferi başarısız:", error);
    }
}

export { connectWallet, transferSpinReward };
