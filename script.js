document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const depositButton = document.getElementById("deposit-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const walletAddressDisplay = document.getElementById("wallet-address");

    let userWallet = null;
    let playerBalance = 0;
    let earnedCoins = 0;
    const slotImages = [
        "https://i.imgur.com/Xpf9bil.png",
        "https://i.imgur.com/toIiHGF.png",
        "https://i.imgur.com/tuXO9tn.png"
    ];

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                walletAddressDisplay.textContent = `Wallet: ${userWallet}`;
                playerBalance = 0; // Başlangıç bakiyesi
                earnedCoins = 0;
                spinButton.disabled = false;
                updateBalances();
            } catch (error) {
                alert("Wallet connection failed!");
            }
        } else {
            alert("Phantom Wallet not found. Please install it.");
        }
    }

    function spinGame() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Insufficient balance!";
            return;
        }

        playerBalance--;
        updateBalances();
        resultMessage.textContent = "🎰 Spinning...";

        const slots = document.querySelectorAll(".slot");
        slots.forEach((slot, index) => {
            setTimeout(() => {
                const randomImage = slotImages[Math.floor(Math.random() * slotImages.length)];
                slot.style.backgroundImage = `url(${randomImage})`;
            }, index * 500);
        });

        setTimeout(() => {
            earnedCoins += 5; // Örnek kazanç
            updateBalances();
            resultMessage.textContent = "🎉 You won 5 coins!";
        }, 2000);
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins`;
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spinGame);
    depositButton.addEventListener("click", () => alert("Deposit feature coming soon!"));
    withdrawButton.addEventListener("click", () => alert("Withdraw feature coming soon!"));
});
