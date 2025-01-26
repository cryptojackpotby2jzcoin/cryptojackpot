const TelegramBot = require('node-telegram-bot-api');
const token = '8090884490:AAFe6j6fjvLzi8XPIsP2TrP1JYwHG3MVpyA';
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
