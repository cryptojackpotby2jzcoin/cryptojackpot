const TelegramBot = require("node-telegram-bot-api");
const token = "8090884490:AAER6UtQpy3A5ayMZ5BFJROx1tQz82QhoGc";
const bot = new TelegramBot(token, { polling: true });

const connectedWallets = new Map(); // Kullanıcıların bağlı cüzdanlarını saklar
const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; // 2JZ Coin Contract Address
const houseWalletAddress = "8090884490:AAER6UtQpy3A5ayMZ5BFJROx1tQz82QhoGc"; // Geçici House Wallet

// Solana Pay URL oluşturucu
function generateSolanaPayUrl(walletAddress, amount, label, message) {
    return `solana:${walletAddress}?amount=${amount}&token=${coinAddress}&label=${encodeURIComponent(label)}&message=${encodeURIComponent(message)}`;
}

// /connectwallet komutu: Kullanıcı cüzdanını bağlar
bot.onText(/\/connectwallet/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const solanaPayUrl = generateSolanaPayUrl(
            houseWalletAddress,
            0,
            "Connect Wallet",
            "Connect your Phantom Wallet"
        );

        // Kullanıcıya Solana Pay bağlantısını gönder
        bot.sendMessage(
            chatId,
            `Cüzdanınızı bağlamak için aşağıdaki bağlantıyı tıklayın:\n\n[Bağlantıyı Tıklayın](${solanaPayUrl})`,
            { parse_mode: "Markdown" }
        );

        connectedWallets.set(chatId, houseWalletAddress); // Bağlantıyı simüle ederiz
        bot.sendMessage(chatId, `✅ Cüzdan başarıyla bağlandı.`);
    } catch (error) {
        console.error("Cüzdan bağlanırken hata oluştu:", error);
        bot.sendMessage(chatId, "⚠️ Cüzdan bağlanırken bir hata oluştu. Lütfen tekrar deneyin.");
    }
});

// /spin komutu: Kullanıcı spin işlemini başlatır
bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;

    if (!connectedWallets.has(chatId)) {
        bot.sendMessage(chatId, "⚠️ Önce cüzdan bağlamalısınız! Lütfen /connectwallet komutunu kullanın.");
        return;
    }

    // Spin sonuçlarını hesaplar
    const spinResult = Math.floor(Math.random() * 100) + 1; // 1-100 arasında rastgele sayı
    let reward = 0;

    if (spinResult > 90) reward = 100;
    else if (spinResult > 50) reward = 5;
    else if (spinResult > 20) reward = 1;

    if (reward > 0) {
        bot.sendMessage(chatId, `🎉 Tebrikler! ${reward} 2JZ Coin kazandınız!`);
    } else {
        bot.sendMessage(chatId, "Spin sonucunda maalesef ödül kazanamadınız. Tekrar deneyin!");
    }
});

// /withdraw komutu: Kullanıcı coinlerini cüzdanına çeker
bot.onText(/\/withdraw/, (msg) => {
    const chatId = msg.chat.id;

    if (!connectedWallets.has(chatId)) {
        bot.sendMessage(chatId, "⚠️ Cüzdanınız bağlı değil! Lütfen önce /connectwallet komutunu kullanın.");
        return;
    }

    // Solana Pay bağlantısı oluştur
    const withdrawUrl = generateSolanaPayUrl(
        houseWalletAddress,
        10, // Örneğin: 10 coin çekmek için
        "Withdraw Coins",
        "Withdraw your 2JZ coins"
    );

    bot.sendMessage(
        chatId,
        `Coinlerinizi çekmek için aşağıdaki bağlantıyı kullanabilirsiniz:\n\n[Bağlantıyı Tıklayın](${withdrawUrl})`,
        { parse_mode: "Markdown" }
    );
});

// /deposit komutu: Kullanıcı coin yatırmak isterse
bot.onText(/\/deposit/, (msg) => {
    const chatId = msg.chat.id;

    const depositUrl = generateSolanaPayUrl(
        houseWalletAddress,
        100, // Örneğin: 100 coin yatırmak için
        "Deposit Coins",
        "Deposit your 2JZ coins for gameplay"
    );

    bot.sendMessage(
        chatId,
        `Coin yatırmak için aşağıdaki bağlantıyı kullanabilirsiniz:\n\n[Bağlantıyı Tıklayın](${depositUrl})`,
        { parse_mode: "Markdown" }
    );
});

// Bot Hata Yönetimi
bot.on("polling_error", (error) => {
    console.error("Telegram Bot Hatası:", error);
});
