window.onload = async function () {
    const spinButton = document.getElementById("spin-button");
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");

    const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF";
    let userWallet = null;
    let playerBalance = 0;
    let earnedCoins = 0;
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

    async function getUserBalance() {
        try {
            const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
            const balance = await connection.getBalance(new solanaWeb3.PublicKey(userWallet));
            return balance / solanaWeb3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
            return 0;
        }
    }

    async function getBalance() {
        try {
            const balance = await getUserBalance();
            playerBalance = balance || 0;
            updateBalances();
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance.toFixed(2)} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins ($${(earnedCoins * coinPrice).toFixed(6)})`;
    }

    function spinGame() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Insufficient balance!";
            return;
        }

        playerBalance--;
        updateBalances();
        resultMessage.textContent = "🎰 Spinning...";

        setTimeout(() => {
            const winChance = Math.random();
            if (winChance < 0.2) {
                earnedCoins += 5;
                resultMessage.textContent = "🎉 Congratulations! You won 5 coins!";
            } else {
                resultMessage.textContent = "❌ No match, better luck next time!";
            }
            updateBalances();
        }, 2000);
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spinGame);

    await connectWallet();
};
