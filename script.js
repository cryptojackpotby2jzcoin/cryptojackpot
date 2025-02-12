document.addEventListener("DOMContentLoaded", async function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const depositButton = document.getElementById("deposit-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const spinButton = document.getElementById("spin-button");
    const weeklyRewardDisplay = document.getElementById("weekly-reward");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const resultMessage = document.getElementById("result-message");

    const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF";
    const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");

    let userWallet = null;
    let playerBalance = 0;
    let earnedCoins = 0;

    // Connect Wallet
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
                alert("Wallet connection failed. Please try again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    // Fetch House Wallet Balance
    async function updateHouseBalance() {
        try {
            const balance = await connection.getBalance(new solanaWeb3.PublicKey(houseWalletAddress));
            const coins = balance / solanaWeb3.LAMPORTS_PER_SOL;
            weeklyRewardDisplay.textContent = `Weekly Reward Pool: ${coins.toFixed(2)} Coins ($${(coins * 0.005).toFixed(2)})`;
            console.log(`💰 House Wallet Balance: ${coins.toFixed(2)} Coins`);
        } catch (error) {
            console.error("❌ Error fetching house balance:", error);
            weeklyRewardDisplay.textContent = "Weekly Reward Pool: Error!";
        }
    }

    // Deposit Coins
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

        const lamports = (amount * solanaWeb3.LAMPORTS_PER_SOL) / 1000;

        try {
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(userWallet),
                    toPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                    lamports: lamports,
                })
            );

            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            playerBalance += parseInt(amount);
            alert(`✅ Successfully deposited ${amount} coins!`);
            updateBalances();
        } catch (error) {
            console.error("❌ Deposit failed:", error);
            alert("❌ Deposit failed. Please try again.");
        }
    }

    // Withdraw Coins
    async function withdrawCoins() {
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        if (earnedCoins <= 0) {
            alert("❌ No coins to withdraw!");
            return;
        }

        const lamports = (earnedCoins * solanaWeb3.LAMPORTS_PER_SOL) / 1000;

        try {
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                    toPubkey: new solanaWeb3.PublicKey(userWallet),
                    lamports: lamports,
                })
            );

            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            earnedCoins = 0;
            alert("✅ Coins successfully withdrawn!");
            updateBalances();
        } catch (error) {
            console.error("❌ Withdraw failed:", error);
            alert("❌ Withdraw failed. Please try again.");
        }
    }

    // Update Balances
    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance.toFixed(2)} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins`;
    }

    // Event Listeners
    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);

    // Initialize
    await connectWallet();
    await updateHouseBalance();
});
