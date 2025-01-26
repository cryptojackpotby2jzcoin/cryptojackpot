window.onload = function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const depositButton = document.getElementById("deposit-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const transferButton = document.getElementById("transfer-button");

    let playerBalance = 20; // Başlangıç bakiyesi

    connectWalletButton.addEventListener("click", async () => {
        try {
            const wallet = window.solana;
            if (!wallet || !wallet.isPhantom) {
                alert("Phantom Wallet bulunamadı!");
                return;
            }
            const response = await wallet.connect();
            const walletAddress = response.publicKey.toString();
            document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
            alert(`Cüzdan bağlandı: ${walletAddress}`);
        } catch (error) {
            console.error("Cüzdan bağlanırken hata:", error);
        }
    });

    spinButton.addEventListener("click", () => {
        if (playerBalance <= 0) {
            alert("Yetersiz bakiye!");
            return;
        }
        playerBalance -= 1;
        console.log("Spin tamamlandı!");
    });

    depositButton.addEventListener("click", () => {
        alert("Coin yatırma işlemi!");
    });

    withdrawButton.addEventListener("click", () => {
        alert("Coin çekme işlemi!");
    });

    transferButton.addEventListener("click", () => {
        alert("Coin transfer işlemi!");
    });
};
