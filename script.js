// Buffer hatasını önlemek için
window.Buffer = window.Buffer || require("buffer").Buffer;

document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");

    let userWallet = null;
    let playerBalance = 0;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet bağlandı:", userWallet);
                await getBalance();
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    async function getBalance() {
        console.log("🔄 Bakiyeniz blockchain'den alınıyor...");
        try {
            // Blockchain'den bakiye çekme
            playerBalance = 100; // Gerçek blockchain bağlantısı burada olacak
            updateBalances();
        } catch (error) {
            console.error("❌ Bakiye alınırken hata oluştu:", error);
        }
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Wallet bağlamadan deposit yapamazsınız!");
            return;
        }

        let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
        amount = parseInt(amount);
        if (isNaN(amount) || amount <= 0) {
            alert("⚠️ Geçerli bir miktar giriniz!");
            return;
        }

        console.log(`🔄 ${amount} coins depositing...`);
        playerBalance += amount;
        alert(`✅ ${amount} coin deposit edildi!`);
        updateBalances();
    }

    async function spin() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Yetersiz bakiye!";
            return;
        }

        console.log("🔄 Blockchain üzerinden spin işlemi başlatılıyor...");

        try {
            playerBalance--;
            updateBalances();
            resultMessage.textContent = "🎰 Spin başarıyla gerçekleşti!";
        } catch (error) {
            console.error("❌ Spin işlemi başarısız oldu:", error);
            alert("Spin sırasında hata oluştu.");
        }
    }

    async function withdrawCoins() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        console.log(`🔄 Blockchain üzerinden withdraw başlatılıyor: ${playerBalance} coin`);
        alert(`✅ ${playerBalance} coin Phantom Wallet'a gönderildi!`);
        playerBalance = 0;
        updateBalances();
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);

    updateBalances();
});
