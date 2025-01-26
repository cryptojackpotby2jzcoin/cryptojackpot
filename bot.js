const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/connectwallet/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        bot.sendMessage(chatId, "Cüzdan bağlantısı başarılı! Artık spin yapabilirsiniz.");
    } catch (error) {
        bot.sendMessage(chatId, "Cüzdan bağlantısı başarısız oldu. Lütfen tekrar deneyin.");
    }
});

bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        bot.sendMessage(chatId, "Spin işlemi başarılı!");
    } catch (error) {
        bot.sendMessage(chatId, "Spin işlemi başarısız oldu.");
    }
});
