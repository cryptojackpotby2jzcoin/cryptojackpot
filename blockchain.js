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
                console.log("✅ Wallet connected:", userWallet);
                await getBalance();
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Wallet connection failed, please try again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    async function getBalance() {
        if (typeof window.getUserBalance === "function") {
            const balance = await window.getUserBalance();
            playerBalance = balance || 0;
            updateBalances();
        } else {
            console.error("getUserBalance function is not defined!");
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    function calculateReward(matches) {
        if (matches === 1) return 1;
        if (matches === 2) return 5;
        if (matches === 3) return 100;
        return 0;
    }

    function spinSlots() {
        const symbols = ["logo", "cherry", "bell", "star", "seven"];
        const slots = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        return slots;
    }

    function countLogos(slots) {
        return slots.filter(symbol => symbol === "logo").length;
    }

    spinButton.addEventListener("click", async () => {
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Insufficient balance!";
            return;
        }

        resultMessage.textContent = "🎰 Spinning...";
        playerBalance--;
        updateBalances();

        setTimeout(() => {
            const slots = spinSlots();
            const logoCount = countLogos(slots);
            const reward = calculateReward(logoCount);

            if (reward > 0) {
                playerBalance += reward;
                resultMessage.textContent = `🎉 Congratulations! You caught ${logoCount} logo(s) and won ${reward} coins!`;
            } else {
                resultMessage.textContent = "❌ No logos caught, better luck next time!";
            }

            updateBalances();
        }, 2000);
    });

    await connectWallet();
};
