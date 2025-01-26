const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_TELEGRAM_BOT_TOKEN'; // Telegram Bot Token
const bot = new TelegramBot(token, { polling: true });

// Phantom Wallet bağlantısı
bot.onText(/\/connectwallet/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const wallet = window.solana;
        if (!wallet || !wallet.isPhantom) {
            bot.sendMessage(chatId, "⚠️ Phantom Wallet bulunamadı. Lütfen cüzdanınızı yükleyin ve tekrar deneyin.");
            return;
        }

        const response = await wallet.connect();
        const walletAddress = response.publicKey.toString();
        bot.sendMessage(chatId, `✅ Cüzdan başarıyla bağlandı: ${walletAddress}`);
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        bot.sendMessage(chatId, "❌ Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
    }
});

// Spin Fonksiyonu
bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Spin işlemi çağrılıyor
        const spinResult = await spin(); // Blockchain.js'deki spin fonksiyonunu çağır

        if (spinResult.winAmount > 0) {
            bot.sendMessage(chatId, `🎉 Spin tamamlandı! Kazandığınız miktar: ${spinResult.winAmount} Coins!`);
        } else {
            bot.sendMessage(chatId, "😢 Spin tamamlandı, ancak coin kazanamadınız. Tekrar deneyin!");
        }
    } catch (error) {
        console.error("Spin işlemi başarısız oldu:", error);
        bot.sendMessage(chatId, "❌ Spin işlemi başarısız oldu. Lütfen tekrar deneyin.");
    }
});

// Bot Hata Yönetimi
bot.on("polling_error", (error) => {
    console.error("Telegram Bot Hatası:", error);
});
