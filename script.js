document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const weeklyRewardDisplay = document.getElementById("weekly-reward");
    const slots = document.querySelectorAll(".slot");

    const programId = "8ZJJj82MrZ9LRq3bhoRHp8wrFPjqf8dZM5CuXnptJa5S";
    const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF";
    const heliusApiKey = "d1c5af3f-7119-494d-8987-cd72bc00bfd0";

    let userWallet = null;
    let playerBalance = 0;
    let earnedCoins = 0;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet connected:", userWallet);
                await updateHouseBalance();
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Wallet connection failed, please try again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    async function updateHouseBalance() {
        try {
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const balance = await connection.getBalance(new solanaWeb3.PublicKey(houseWalletAddress));
            const coins = balance / solanaWeb3.LAMPORTS_PER_SOL;
            weeklyRewardDisplay.textContent = `Weekly Reward Pool: ${coins.toFixed(2)} Coins ($${(coins * 0.005).toFixed(2)})`;
        } catch (error) {
            console.error("❌ Error fetching house balance:", error);
        }
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        const amount = prompt("Enter the number of coins to deposit (max 10,000):");
        if (!amount || isNaN(amount) || amount <= 0 || amount > 10000) {
            alert("❌ Invalid deposit amount!");
            return;
        }

        const lamports = amount * solanaWeb3.LAMPORTS_PER_SOL / 1000;

        try {
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(userWallet),
                    toPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                    lamports: lamports
                })
            );

            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            playerBalance += parseInt(amount);
            updateBalances();
            alert(`✅ Successfully deposited ${amount} coins!`);
        } catch (error) {
            console.error("❌ Deposit failed:", error);
            alert("❌ Deposit failed. Please try again.");
        }
    }

    async function withdrawCoins() {
        if (earnedCoins <= 0) {
            alert("⚠️ No earned coins to withdraw!");
            return;
        }

        const lamports = earnedCoins * solanaWeb3.LAMPORTS_PER_SOL / 1000;

        try {
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                    toPubkey: new solanaWeb3.PublicKey(userWallet),
                    lamports: lamports
                })
            );

            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            earnedCoins = 0;
            updateBalances();
            alert("✅ Coins withdrawn successfully!");
        } catch (error) {
            console.error("❌ Withdraw failed:", error);
            alert("❌ Withdraw failed. Please try again.");
        }
    }

    function spinGame() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Insufficient balance!";
            return;
        }

        resultMessage.textContent = "🎰 Spinning...";
        playerBalance--;
        updateBalances();

        setTimeout(() => {
            const win = Math.random() < 0.3; // %30 kazanma şansı
            if (win) {
                earnedCoins += 10;
                resultMessage.textContent = "🎉 You won 10 coins!";
            } else {
                resultMessage.textContent = "❌ You lost, try again!";
            }
            updateBalances();
        }, 2000);
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance.toFixed(2)} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins`;
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spinGame);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);

    connectWallet();
});
