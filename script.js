window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const walletAddressDisplay = document.getElementById("wallet-address");

    let playerBalance = 0; // Oyuncunun başlangıç bakiyesi
    const coinPrice = 0.000005775; // Coin fiyatı

    async function connectWallet() {
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
            return;
        }

        try {
            const response = await window.solana.connect();
            const walletAddress = response.publicKey.toString();
            walletAddressDisplay.innerText = `Wallet: ${walletAddress}`;
            playerBalance = 20; // İlk kez bağlanan oyuncuya 20 coin
            updateBalances();
        } catch (error) {
            console.error("Cüzdan bağlantısı başarısız oldu:", error);
            alert("Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın.";
            return;
        }

        spinButton.disabled = true;
        playerBalance--;
        updateBalances();

        // Spin animasyonu burada
        setTimeout(() => {
            resultMessage.textContent = "Kazandınız veya kaybettiniz!"; // Örnek çıktı
            spinButton.disabled = false;
        }, 2000);
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);

    updateBalances();
};
