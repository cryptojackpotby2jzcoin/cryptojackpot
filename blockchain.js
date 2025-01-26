import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// Solana testnet bağlantısı
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// 2JZ Coin mint adresi
const tokenMintAddress = new PublicKey('GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump');

// House wallet public key (ödül havuzunun cüzdan adresi)
const houseWalletPublicKey = new PublicKey('YOUR_HOUSE_WALLET_PUBLIC_KEY');

// İlk 10 bin oyuncu kontrolü için liste (Geçici çözüm)
let playerList = []; // Cüzdan adreslerini saklamak için liste
const maxPlayers = 10000; // 10 bin limit

// Phantom Wallet bağlantısı
const wallet = window.solana;

// Cüzdan bağlama ve başlangıç bakiyesi kontrolü
async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return;
    }

    try {
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();

        console.log("Cüzdan Bağlandı:", playerAddress);

        // Eğer oyuncu zaten kayıtlıysa
        if (playerList.includes(playerAddress)) {
            alert("Cüzdanınız zaten kayıtlı. Oyuna devam edebilirsiniz!");
            return;
        }

        // Eğer limit dolmadıysa ve oyuncu ilk kez giriş yapıyorsa
        if (playerList.length < maxPlayers) {
            playerList.push(playerAddress); // Oyuncuyu listeye ekle
            await addInitialCoins(playerAddress); // Oyuncuya 20 coin ekle
            alert("Tebrikler! Oyuna 20 coin ile başladınız.");
        } else {
            alert("10 bin kişilik limit doldu. Oyuna devam etmek için coin satın almanız gerekiyor.");
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
                fromPubkey: houseWalletPublicKey, // Ödül havuzu cüzdanı
                toPubkey: new PublicKey(playerAddress),
                lamports: 20 * 1e9, // 20 coin (SOL'a çevrildi)
            })
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = houseWalletPublicKey;

        // İşlemi imzala ve gönder
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        console.log("20 coin başarıyla eklendi:", signature);
    } catch (error) {
        console.error("20 coin eklenirken hata oluştu:", error);
    }
}

export { connectWallet };
