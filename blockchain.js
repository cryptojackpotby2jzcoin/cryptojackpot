import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// Phantom Wallet bağlantısı
const wallet = window.solana;

async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet not found. Please install it.");
        return false;
    }

    try {
        const response = await wallet.connect();
        const walletAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
        return true;
    } catch (error) {
        console.error("Wallet connection failed:", error);
        return false;
    }
}

async function transferSpinReward(walletAddress, rewardAmount) {
    try {
        console.log(`Transferring ${rewardAmount} coins to ${walletAddress}`);
        // Placeholder for real transaction
    } catch (error) {
        console.error("Reward transfer failed:", error);
    }
}

export { connectWallet, transferSpinReward };
