// Buffer'ı doğrudan bir script etiketiyle import ediyoruz
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/buffer/5.7.1/buffer.min.js";
script.onload = () => {
    window.Buffer = Buffer;
};
document.head.appendChild(script);

// ✅ Solana bağlantısı (Mainnet RPC)
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

// ✅ 2JZ Coin mint adresi
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");

// ✅ Kullanıcının 2JZ Coin bakiyesini sorgula
async function getUserBalance() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("❌ Wallet bağlı değil!");
        return;
    }

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
            window.solana.publicKey,
            { mint: tokenMintAddress }
        );

        let balance = 0;

        if (accounts.value.length > 0) {
            balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        }

        console.log(`🔄 Kullanıcının 2JZ Coin Bakiyesi: ${balance}`);
        return balance;

    } catch (error) {
        console.error("❌ Bakiye alınırken hata oluştu:", error);
        return 0;
    }
}

// Fonksiyonu global hale getiriyoruz
window.getUserBalance = getUserBalance;

// ✅ Deposit Fonksiyonu - Oyun bakiyesine coin ekleme
async function depositCoins(amount) {
    const currentBalance = await getUserBalance();
    if (currentBalance < amount) {
        alert("❌ Yetersiz bakiye! Daha fazla coin yatırmak için cüzdanınıza coin ekleyin.");
        return 0;
    }

    // Oyun içi bakiye artırma
    window.gameBalance = (window.gameBalance || 0) + amount;
    console.log(`💰 ${amount} 2JZ Coin oyun bakiyesine eklendi. Toplam: ${window.gameBalance}`);
    return window.gameBalance;
}

// Fonksiyonu global hale getiriyoruz
window.depositCoins = depositCoins;

// ✅ Spin Fonksiyonu - Oyun bakiyesinden coin eksiltme
async function spinGame() {
    if (!window.gameBalance || window.gameBalance <= 0) {
        alert("❌ Oyun bakiyeniz yetersiz. Lütfen coin yatırın!");
        return;
    }

    window.gameBalance--;
    console.log(`🎰 Spin atıldı! Kalan oyun bakiyesi: ${window.gameBalance}`);

    // Kazanma ihtimali ve ödül hesaplaması
    const winChance = Math.random();
    if (winChance > 0.7) {
        const reward = 5;  // Kazanma ödülü
        window.gameBalance += reward;
        console.log(`🎉 Tebrikler! ${reward} 2JZ Coin kazandınız! Yeni bakiye: ${window.gameBalance}`);
        alert(`🎉 Tebrikler! ${reward} 2JZ Coin kazandınız!`);
    } else {
        console.log("😢 Maalesef bu sefer kazanamadınız.");
        alert("😢 Maalesef bu sefer kazanamadınız.");
    }
}

// Fonksiyonu global hale getiriyoruz
window.spinGame = spinGame;
