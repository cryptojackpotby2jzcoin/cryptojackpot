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

    const icons = [
        'https://i.imgur.com/Xpf9bil.png',
        'https://i.imgur.com/toIiHGF.png',
        'https://i.imgur.com/tuXO9tn.png'
    ];

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
            alert("Phantom Wallet bulunamadı.");
        }
    }

    async function spin() {
        if (!userWallet) {
            alert("Önce wallet bağlamalısınız!");
            return;
        }
        if (isSpinning) return;
        isSpinning = true;

        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz bakiye!";
            return;
        }

        playerBalance--;
        spins++;
        updateBalances();

        setTimeout(() => {
            let win = Math.random() < 0.2;
            if (win) {
                let winAmount = Math.floor(Math.random() * 10) + 1;
                temporaryBalance += winAmount;
                resultMessage.textContent = `Kazandınız! ${winAmount} coin eklendi.`;
            } else {
                resultMessage.textContent = "Kaybettiniz, tekrar deneyin!";
            }
            updateBalances();
            isSpinning = false;
        }, 2000);
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    depositButton.addEventListener("click", () => {
        alert("Deposit işlemi başlatılıyor...");
    });
    withdrawButton.addEventListener("click", () => {
        alert("Withdraw işlemi başlatılıyor...");
    });

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins`;
        spinCounterDisplay.textContent = `Spin: ${spins}`;
    }
});
