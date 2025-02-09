document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const transferButton = document.getElementById("transfer-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");
    const weeklyRewardDisplay = document.getElementById("weekly-reward");

    const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF";
    let userWallet = null;
    let playerBalance = 0;
    let earnedCoins = 0;
    let spins = 0;
    let isSpinning = false;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet connected:", userWallet);
                await getBalance();
                await getHouseBalance();
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Wallet connection failed, please try again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    async function getHouseBalance() {
        try {
            const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
            const balance = await connection.getBalance(new solanaWeb3.PublicKey(houseWalletAddress));
            const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            weeklyRewardDisplay.textContent = `Weekly Reward Pool: ${solBalance.toFixed(2)} Coins ($${(solBalance * 0.005).toFixed(2)})`;
        } catch (error) {
            console.error("❌ Error fetching house balance:", error);
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
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins`;
        spinCounterDisplay.textContent = spins;
    }

    async function withdrawCoins() {
        console.log("💰 Withdraw function executed.");
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        if (earnedCoins <= 0) {
            alert("⚠️ No coins to withdraw!");
            return;
        }

        try {
            const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                    toPubkey: new solanaWeb3.PublicKey(userWallet),
                    lamports: earnedCoins * solanaWeb3.LAMPORTS_PER_SOL / 1000 
                })
            );
            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature);
            alert("💰 Coins withdrawn successfully!");
            earnedCoins = 0;
            updateBalances();
        } catch (error) {
            console.error("❌ Withdraw failed:", error);
            alert("❌ Withdraw failed. Please try again.");
        }
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        const depositAmount = prompt("Enter the number of coins to deposit (max 10,000):");
        if (depositAmount > 10000 || depositAmount <= 0) {
            alert("⚠️ Invalid deposit amount. Max: 10,000 coins.");
            return;
        }

        try {
            const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(userWallet),
                    toPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                    lamports: depositAmount * solanaWeb3.LAMPORTS_PER_SOL / 1000 
                })
            );
            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature);
            alert("✅ Coins deposited successfully!");
            playerBalance += parseInt(depositAmount, 10);
            updateBalances();
        } catch (error) {
            console.error("❌ Deposit failed:", error);
            alert("❌ Deposit failed. Please try again.");
        }
    }

    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    connectWalletButton.addEventListener("click", connectWallet);

    spinButton.addEventListener("click", async () => {
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        if (playerBalance <= 0) {
            resultMessage.textContent = "⚠️ Insufficient balance!";
            return;
        }

        playerBalance--;
        spins++;
        try {
            resultMessage.textContent = "🎰 Spinning...";
            await spinGame();
        } catch (error) {
            console.error("❌ Spin failed:", error);
            resultMessage.textContent = "❌ Spin failed. Please try again.";
        }
    });

    transferButton.addEventListener("click", transferCoins);
    connectWallet();
});
