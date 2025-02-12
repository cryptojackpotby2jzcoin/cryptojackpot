// Smart Contract ile entegre edilmiş script.js

// Buffer için tarayıcı Polyfill
if (typeof Buffer === "undefined") {
    window.Buffer = require("buffer/").Buffer;
}

document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    const programId = new solanaWeb3.PublicKey("8ZJJj82MrZ9LRq3bhoRHp8wrFPjqf8dZM5CuXnptJa5S"); // Smart Contract ID
    const houseWalletAddress = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF"); // House Wallet
    const RPC_URL = "https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0"; // Helius RPC

    let userWallet = null;
    let playerBalance = 0;
    let earnedCoins = 0;
    let spins = 0;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = new solanaWeb3.PublicKey(response.publicKey);
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet connected:", userWallet.toString());
                await getBalance();
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Wallet connection failed. Please try again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    async function getBalance() {
        try {
            const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");
            const balance = await connection.getBalance(userWallet);
            playerBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            updateBalances();
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
            alert("Error fetching balance. Please try again.");
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance.toFixed(2)} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins`;
        spinCounterDisplay.textContent = `Total Spins: ${spins}`;
    }

    async function depositCoins() {
        const amount = parseFloat(prompt("Enter the number of coins to deposit (max 10,000):"));
        if (!amount || isNaN(amount) || amount <= 0 || amount > 10000) {
            alert("❌ Invalid deposit amount!");
            return;
        }

        try {
            const lamports = amount * solanaWeb3.LAMPORTS_PER_SOL;
            const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");

            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: userWallet,
                    toPubkey: houseWalletAddress,
                    lamports: lamports,
                })
            );

            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            alert(`✅ Successfully deposited ${amount} coins!`);
            playerBalance -= amount;
            updateBalances();
        } catch (error) {
            console.error("❌ Deposit failed:", error);
            alert("❌ Deposit failed. Please try again.");
        }
    }

    async function withdrawCoins() {
        if (earnedCoins <= 0) {
            alert("❌ No coins to withdraw!");
            return;
        }

        try {
            const lamports = earnedCoins * solanaWeb3.LAMPORTS_PER_SOL;
            const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");

            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: houseWalletAddress,
                    toPubkey: userWallet,
                    lamports: lamports,
                })
            );

            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            alert(`✅ Successfully withdrew ${earnedCoins} coins!`);
            earnedCoins = 0;
            updateBalances();
        } catch (error) {
            console.error("❌ Withdraw failed:", error);
            alert("❌ Withdraw failed. Please try again.");
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
});
