const TelegramBot = require('node-telegram-bot-api');
const token = '8090884490:AAFe6j6fjvLzi8XPIsP2TrP1JYwHG3MVpyA'; // Telegram Bot Tokenınızı buraya ekleyin
const bot = new TelegramBot(token, { polling: true });

const { initGame } = require('./blockchain'); // Blockchain.js'den initGame fonksiyonunu çekiyoruz

// Cüzdan Bağlantısı Komutu
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
        bot.sendMessage(chatId, `✅ Cüzdan başarıyla bağlandı: ${walletAddress}`);
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        bot.sendMessage(chatId, "⚠️ Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
    }
});

// Spin Komutu
bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Oyuncunun cüzdan bağlantısını kontrol et
        const wallet = window.solana;

        if (!wallet || !wallet.isPhantom) {
            bot.sendMessage(chatId, "Lütfen önce cüzdanınızı bağlayın. /connectwallet komutunu kullanabilirsiniz.");
            return;
        }

        // Spin işlemini başlat
        const spinResult = await spin(); // Blockchain.js'deki spin fonksiyonunu çağır

        // Spin sonucu başarılı ise
        bot.sendMessage(chatId, `🎉 Spin tamamlandı! Kazandığınız miktar: ${spinResult} Coins!`);
    } catch (error) {
        console.error("Spin işlemi başarısız oldu:", error);
        bot.sendMessage(chatId, "❌ Spin işlemi başarısız oldu. Lütfen tekrar deneyin.");
    }
});

// Bot Hata Yönetimi
bot.on("polling_error", (error) => {
    console.error("Telegram Bot Hatası:", error);
});
