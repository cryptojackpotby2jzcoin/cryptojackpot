const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/connectwallet/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Phantom Wallet bağlantısını başlat
        const wallet = window.solana;

        if (!wallet || !wallet.isPhantom) {
            bot.sendMessage(chatId, "Phantom Wallet bulunamadı. Lütfen cüzdanınızı yükleyin ve tekrar deneyin.");
            return;
        }

        const response = await wallet.connect();
        const walletAddress = response.publicKey.toString();
        bot.sendMessage(chatId, `Cüzdan başarıyla bağlandı: ${walletAddress}`);
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        bot.sendMessage(chatId, "Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
    }
});

bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await spin(); // Blockchain işlemini çağır
        bot.sendMessage(chatId, "Spin tamamlandı! Sonucu kontrol edin.");
    } catch (error) {
        bot.sendMessage(chatId, "Spin işlemi başarısız oldu.");
    }
});
