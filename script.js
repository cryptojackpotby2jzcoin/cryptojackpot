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
    let isSpinning = false;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                await getBalance();
            } catch (error) {
                alert("Wallet bağlantısı başarısız oldu, tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    async function getBalance() {
        playerBalance = 100; // Örnek veri
        updateBalances();
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
        amount = parseInt(amount);
        if (amount <= 0) return;

        alert(`✅ ${amount} coin deposit edildi!`);
        playerBalance += amount;
        updateBalances();
    }

    async function spin() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        if (isSpinning || playerBalance <= 0) {
            return;
        }

        isSpinning = true;
        playerBalance--;
        spins++;
        updateBalances();

        setTimeout(() => {
            let win = Math.random() < 0.2;
            if (win) {
                let winAmount = Math.floor(Math.random() * 10) + 1;
                temporaryBalance += winAmount;
                resultMessage.textContent = `🎉 Kazandınız! ${winAmount} coin eklendi.`;
            } else {
                resultMessage.textContent = "😢 Kaybettiniz, tekrar deneyin!";
            }
            isSpinning = false;
            updateBalances();
        }, 2000);
    }

    async function withdrawCoins() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

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
});
