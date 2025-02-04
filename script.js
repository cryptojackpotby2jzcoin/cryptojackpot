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
        try {
            const balance = await window.getUserBalance();
            playerBalance = balance || 0;
            updateBalances();
        } catch (error) {
            console.error("❌ Bakiye alınırken hata oluştu:", error);
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", () => alert("Spin işlemi için diğer dosyayı kullanın"));
    depositButton.addEventListener("click", () => alert("Deposit işlemi henüz tanımlanmadı."));
    withdrawButton.addEventListener("click", () => alert("Withdraw işlemi henüz tanımlanmadı."));

    updateBalances();
});
