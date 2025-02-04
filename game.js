window.onload = async function () {
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");

    let userWallet = null;
    let playerBalance = 0;
    const coinPrice = 0.000009295;

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
        if (typeof window.getUserBalance === "function") {
            const balance = await window.getUserBalance();
            playerBalance = balance || 0;
            updateBalances();
        } else {
            console.error("getUserBalance fonksiyonu tanımlı değil!");
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    spinButton.addEventListener("click", async () => {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Yetersiz bakiye!";
            return;
        }

        resultMessage.textContent = "🎰 Spinning...";
        playerBalance--;
        updateBalances();
        setTimeout(() => {
            resultMessage.textContent = "🎉 Tebrikler! Kazandınız!";
        }, 2000);
    });

    await connectWallet();
};
