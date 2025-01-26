window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    let playerBalance = 0; // Oyuncunun başlangıç bakiyesi
    const coinPrice = 0.000005775; // Coin fiyatı

    async function handleSpin() {
        // Cüzdanın bağlı olup olmadığını kontrol et
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
            return;
        }

        if (!window.solana.isConnected) {
            try {
                await window.solana.connect();
                const walletAddress = window.solana.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
                playerBalance = 20; // İlk bağlantıda 20 coin eklenir
                updateBalances();
            } catch (error) {
                console.error("Cüzdan bağlantısı başarısız oldu:", error);
                alert("Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
                return;
            }
        }

        // Spin işlemini başlat
        spin();
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın veya transfer edin.";
            return;
        }

        spinButton.disabled = true; // Spin butonunu geçici olarak devre dışı bırak
        resultMessage.textContent = ""; // Mesajı temizle
        playerBalance--; // Bakiyeden 1 coin düş

        // Spin animasyonu ve sonucu burada işlenecek
        // ...

        updateBalances();
        spinButton.disabled = false; // Spin butonunu tekrar aktif et
    }

    spinButton.addEventListener("click", handleSpin);
    updateBalances();
};
