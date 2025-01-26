import { Connection, PublicKey } from '@solana/web3.js';

// Solana testnet bağlantısı
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// 2JZ Coin mint adresi
const tokenMintAddress = new PublicKey('GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump');

// İlk 10 bin oyuncu kontrolü için liste
let playerList = [];
const maxPlayers = 10000;

// Phantom Wallet bağlantısı
const wallet = window.solana;

// Oyuna girişte otomatik cüzdan bağlantısı
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
        document.getElementById('walletAddress').innerText = `Cüzdan Adresiniz: ${playerAddress}`;

        // Oyuncu ilk kez bağlanıyorsa 20 coin ekleme yerine listeye ekle
        if (!playerList.includes(playerAddress) && playerList.length < maxPlayers) {
            playerList.push(playerAddress); // Oyuncuyu listeye ekle
            alert("Tebrikler! Oyuna 0 coin ile başlıyorsunuz. Coin almak için lütfen yükleme yapın.");
        } else if (!playerList.includes(playerAddress)) {
            alert("10 bin kişilik limit dolduğu için coin yüklenmedi. 0 coinle başlıyorsunuz.");
        }
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlanırken bir hata oluştu.");
    }
}

export { initGame };
