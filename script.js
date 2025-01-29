import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; 
const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF"; 

document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                const walletAddress = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
                console.log("✅ Wallet bağlandı:", walletAddress);
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
});
