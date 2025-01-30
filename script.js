document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    let userWallet = null;
    let playerBalance = 0;
    let temporaryBalance = 0;
    let spins = 0;
    const programId = "7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv"; // Smart Contract ID

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet bağlandı:", userWallet);
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Wallet bağlamadan deposit yapamazsınız!");
            return;
        }

        let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
        amount = parseInt(amount);
        if (amount <= 0) return;

        console.log(`🔄 ${amount} coins depositing...`);
        // Smart Contract'a gönder (Örnek işlem, backend'e bağlanınca aktif olacak)
        alert(`✅ ${amount} coin deposit edildi!`);
    }

    async function spin() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        console.log("🔄 Spin işlemi başlatılıyor...");
        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Yetersiz bakiye!";
            return;
        }

        playerBalance--;
        spins++;
        updateBalances();

        setTimeout(() => {
            let win = Math.random() < 0.2; // %20 kazanma şansı
            if (win) {
                let winAmount = Math.floor(Math.random() * 10) + 1;
                temporaryBalance += winAmount;
                resultMessage.textContent = `🎉 Kazandınız! ${winAmount} coin eklendi.`;
            } else {
                resultMessage.textContent = "😢 Kaybettiniz, tekrar deneyin!";
            }
            updateBalances();
        }, 2000);
    }

    async function withdrawCoins() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }
        if (temporaryBalance <= 0) {
            alert("⚠️ Çekilecek coin yok!");
            return;
        }

        console.log(`🔄 Withdraw başlatıldı: ${temporaryBalance} coin`);
        alert(`✅ ${temporaryBalance} coin Phantom Wallet'a gönderildi!`);
        temporaryBalance = 0;
        updateBalances();
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins`;
        spinCounterDisplay.textContent = `Spin: ${spins}`;
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    
    updateBalances();
});
