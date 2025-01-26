import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// Solana testnet bağlantısı
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// 2JZ Coin mint adresi
const tokenMintAddress = new PublicKey('GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump');

// House wallet public key (ödül havuzu cüzdan adresi)
const houseWalletPublicKey = new PublicKey('5dA8kKepycbZ43Zm3MuzRGro5KkkzoYusuqjz8MfTBwn'); // Güncel house wallet adresinizi girin

// İlk 10.000 oyuncu kontrolü için liste
let playerList = [];
const maxPlayers = 10000;

// Phantom Wallet bağlantısı
const wallet = window.solana;

// Cüzdan bağlantısı ve başlangıç ödülü dağıtımı
async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return;
    }

    try {
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${playerAddress}`;

        // Oyuncuya ilk kez bağlanıyorsa 20 coin ekle
        if (!playerList.includes(playerAddress) && playerList.length < maxPlayers) {
            playerList.push(playerAddress);
            await addInitialCoins(playerAddress);
            alert("Tebrikler! Oyuna 20 coin ile başladınız.");
        }
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlanırken bir hata oluştu.");
    }
}

// Oyuncuya başlangıç coini ekleme
async function addInitialCoins(playerAddress) {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: houseWalletPublicKey,
                toPubkey: new PublicKey(playerAddress),
                lamports: 20 * 1e9, // 20 coin (Solana birimi lamports üzerinden hesaplanır)
            })
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = houseWalletPublicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        console.log("20 coin başarıyla eklendi:", signature);
    } catch (error) {
        console.error("20 coin eklenirken hata oluştu:", error);
    }
}

// Spin işlemi için ödül transferi
async function transferSpinReward(playerAddress, rewardAmount) {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: houseWalletPublicKey,
                toPubkey: new PublicKey(playerAddress),
                lamports: rewardAmount * 1e9, // Ödül miktarı
            })
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = houseWalletPublicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        console.log(`${rewardAmount} coin başarıyla transfer edildi:`, signature);
    } catch (error) {
        console.error("Ödül transferi sırasında hata oluştu:", error);
    }
}

export { connectWallet, transferSpinReward };
