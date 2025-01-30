document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const transferButton = document.getElementById("transfer-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    let playerBalance = 20;
    let temporaryBalance = 0;
    let spins = 0;
    const coinPrice = 0.000005775;
    let userWallet = null;
    const houseWallet = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF"; // House Wallet Adresi
    const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; // 2JZ Coin CA

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Spin: ${spins}`;
    }

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet bağlandı:", userWallet);
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
            }
        } else {
            console.log("🚀 Phantom Wallet bulunamadı, doğrudan Solana Pay ile bağlanılıyor...");
            connectWalletViaSolanaPay();
        }
    }

    function connectWalletViaSolanaPay() {
        const solanaPayUrl = `solana:${houseWallet}?amount=0&token=${coinAddress}&label=Crypto%20Jackpot&message=Connect%20Wallet`;
        window.open(solanaPayUrl, "_blank");

        setTimeout(checkWalletConnected, 5000);
    }

    async function checkWalletConnected() {
        if (window.solana && window.solana.isPhantom) {
            const response = await window.solana.connect();
            userWallet = response.publicKey.toString();
            document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
            console.log("✅ Wallet bağlandı:", userWallet);
        } else {
            console.log("⚠️ Wallet hala bağlanmadı!");
        }
    }

    function depositCoins() {
        if (!userWallet) {
            console.log("🚀 Phantom Wallet bulunamadı, doğrudan Solana Pay ile deposit yapılıyor...");
        }

        const solanaPayUrl = `solana:${houseWallet}?amount=100&token=${coinAddress}&label=Crypto%20Jackpot&message=Deposit%20for%20game%20balance`;
        window.open(solanaPayUrl, "_blank");
    }

    async function withdrawCoins() {
        if (!userWallet) {
            console.log("🚀 Phantom Wallet bulunamadı, doğrudan Solana Pay ile withdraw yapılıyor...");
        }
        if (temporaryBalance <= 0) {
            console.log("⚠️ Çekilecek coin yok!");
            return;
        }

        console.log(`✅ Withdraw işlemi başlatıldı! Çekilen: ${temporaryBalance} Coins`);
        temporaryBalance = 0;
        updateBalances();
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    transferButton.addEventListener("click", () => {
        if (temporaryBalance > 0) {
            playerBalance += temporaryBalance;
            temporaryBalance = 0;
            resultMessage.textContent = "✅ Coins transferred to your main balance!";
            updateBalances();
        } else {
            resultMessage.textContent = "⚠️ No coins to transfer!";
        }
    });

    updateBalances();
});
