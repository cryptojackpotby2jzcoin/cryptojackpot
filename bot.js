const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");
const token = "8090884490:AAFe6j6fjvLzi8XPIsP2TrP1JYwHG3MVpyA";
const bot = new TelegramBot(token, { polling: true });

// 2JZ Coin CA ve House Wallet
const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; // 2JZ Coin CA
const houseWalletAddress = "5dA8kKepycbZ43Zm3MuzRGro5KkkzoYusuqjz8MfTBwn"; // Geçici House Wallet

const connectedWallets = new Map(); // Bağlı cüzdanları kaydeder
let coinPrice = 0.000005775; // Varsayılan fiyat

// 2JZ Coin fiyatını güncelleyen fonksiyon
async function updateCoinPrice() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=2jz&vs_currencies=usd`);
        const data = await response.json();
        coinPrice = data["2jz"].usd || coinPrice; // Güncel fiyat
        console.log(`2JZ Coin Fiyatı Güncellendi: $${coinPrice}`);
    } catch (error) {
        console.error("2JZ coin fiyatı güncellenirken hata oluştu:", error);
    }
}

// Solana Pay URL oluşturucu
function generateSolanaPayUrl(walletAddress, amount = 20) {
    return `solana:${houseWalletAddress}?amount=${amount}&token=${coinAddress}&label=CryptoJackpot&message=Connect%20Wallet`;
}

// /connectwallet komutu: Kullanıcı cüzdanını bağlar
bot.onText(/\/connectwallet/, async (msg) => {
    const chatId = msg.chat.id;

    // Kullanıcıya Solana Pay bağlantısını gönder
    const solanaPayUrl = generateSolanaPayUrl(houseWalletAddress);
    bot.sendMessage(chatId, `Cüzdanınızı bağlamak için aşağıdaki bağlantıyı kullanın:\n\n[Bağlantıyı Tıklayın](${solanaPayUrl})`, {
        parse_mode: "Markdown",
    });
});

// /spin komutu: Spin işlemini gerçekleştirir
bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;

    // Kullanıcının cüzdanının bağlı olup olmadığını kontrol et
    if (!connectedWallets.has(chatId)) {
        bot.sendMessage(chatId, "⚠️ Cüzdan bağlı değil! Lütfen önce /connectwallet komutunu kullanarak bağlanın.");
        return;
    }

    // Rastgele spin sonucu üret
    const spinResult = Math.floor(Math.random() * 100) + 1; // 1-100 arası rastgele sayı
    const reward = spinResult > 90 ? 100 : spinResult > 50 ? 5 : spinResult > 20 ? 1 : 0; // Ödül kuralları

    // Kullanıcıya spin sonucunu ve ödülü göster
    if (reward > 0) {
        bot.sendMessage(chatId, `🎉 Tebrikler! Spin sonucunuz: ${spinResult} \nKazandığınız ödül: ${reward} 2JZ Coin!`);
    } else {
        bot.sendMessage(chatId, `Spin sonucunuz: ${spinResult}. Maalesef bu sefer ödül kazanamadınız. Tekrar deneyin!`);
    }
});

// /deposit komutu: Kullanıcıya Solana Pay ile coin yatırma bağlantısı sağlar
bot.onText(/\/deposit/, (msg) => {
    const chatId = msg.chat.id;

    // Solana Pay bağlantısı oluştur
    const depositUrl = generateSolanaPayUrl(houseWalletAddress, 100); // Örnek: 100 coin
    bot.sendMessage(chatId, `Coin yatırmak için aşağıdaki bağlantıyı kullanabilirsiniz:\n\n[Bağlantıyı Tıklayın](${depositUrl})`, {
        parse_mode: "Markdown",
    });
});

// Coin fiyatını düzenli olarak güncelle
setInterval(updateCoinPrice, 60000); // Her 1 dakikada bir fiyat güncellenir

// Bot Hata Yönetimi
bot.on("polling_error", (error) => {
    console.error("Telegram Bot Hatası:", error);
});
