import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// Solana testnet bağlantısı
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// 2JZ Coin mint adresi
const tokenMintAddress = new PublicKey('GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump');

// House wallet public key (ödül havuzu cüzdan adresi)
const houseWalletPublicKey = new PublicKey('6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF');

// İlk 10.000 oyuncu kontrolü için liste
let playerList = [];
const maxPlayers = 10000;

// Phantom Wallet bağlantısı
const wallet = window.solana;

// Cüzdan bağlantısı ve başlangıç ödülü
async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return false;
    }

    try {
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${playerAddress}`;

        // Eğer kullanıcı ilk 10,000 içindeyse 20 coin ekle
        if (!playerList.includes(playerAddress) && playerList.length < maxPlayers) {
            playerList.push(playerAddress);
            await addInitialCoins(playerAddress);
            alert("Tebrikler! Oyuna 20 coin ile başladınız.");
        }
        return true;
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlanırken bir hata oluştu.");
        return false;
    }
}

// Oyuncuya başlangıç coini ekleme
async function addInitialCoins(playerAddress) {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: houseWalletPublicKey,
                toPubkey: new PublicKey(playerAddress),
                lamports: 20 * 1e9, // 20 coin
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

export { connectWallet };

async function connectWallet() {
    if (!window.solana) {
        alert("Phantom Wallet bulunamadı! Lütfen yükleyin ve tekrar deneyin.");
        return;
    }

    try {
        const response = await window.solana.connect();
        document.getElementById("wallet-address").innerText = `Wallet: ${response.publicKey.toString()}`;
    } catch (error) {
        console.error("Wallet bağlantı hatası:", error);
    }
}

document.getElementById("connect-wallet-button").addEventListener("click", connectWallet);
