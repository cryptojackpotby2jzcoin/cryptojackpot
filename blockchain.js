import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// Solana testnet bağlantısı
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// 2JZ Coin mint adresi
const tokenMintAddress = new PublicKey('GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump');

// House wallet public key (ödül havuzu cüzdan adresi)
const houseWalletPublicKey = new PublicKey('YOUR_HOUSE_WALLET_PUBLIC_KEY');

// İlk 10.000 oyuncu kontrolü için liste
let playerList = [];
const maxPlayers = 10000;

// Phantom Wallet bağlantısı
const wallet = window.solana;

// Oyuna girişte cüzdan bağlantısı
async function initGame() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return;
    }

    try {
        // Cüzdan bağlantısı
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();

        console.log("Cüzdan Bağlandı:", playerAddress);

        // Cüzdan adresini ekranda göster
        const walletAddressElement = document.getElementById('wallet-address');
        if (walletAddressElement) {
            walletAddressElement.innerText = `Wallet: ${playerAddress}`;
        }

        // Oyuncu ilk kez bağlanıyorsa ve limit dolmadıysa 20 coin ekle
        if (!playerList.includes(playerAddress) && playerList.length < maxPlayers) {
            playerList.push(playerAddress); // Oyuncuyu listeye ekle
            await addInitialCoins(playerAddress); // 20 coin ekle
            alert("Tebrikler! Oyuna 20 coin ile başladınız.");
        } else if (!playerList.includes(playerAddress)) {
            alert("10.000 kişilik limit dolduğu için coin yüklenmedi. 0 coinle başlıyorsunuz.");
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
                lamports: 20 * 1e9, // 20 coin (SOL biriminde)
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
        alert("Coin yükleme işlemi başarısız oldu. Lütfen tekrar deneyin.");
    }
}

export { initGame };
