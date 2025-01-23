const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await spin(); // Blockchain işlemini çağır
        bot.sendMessage(chatId, "Spin tamamlandı! Sonucu kontrol edin.");
    } catch (error) {
        bot.sendMessage(chatId, "Spin işlemi başarısız oldu.");
    }
});