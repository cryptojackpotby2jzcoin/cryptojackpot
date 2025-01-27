// Updated Script.js
import { connectWallet, transferSpinReward, fetchDynamicCoinPrice } from './blockchain.js';

window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const transferButton = document.getElementById("transfer-button");
    const depositButton = document.getElementById("deposit-button");
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");
    const weeklyRewardDisplay = document.getElementById("weekly-reward");

    let playerBalance = 0; // Player balance
    let temporaryBalance = 0; // Earned coins
    let spins = 0; // Total spins
    let coinPrice = 0.000005775; // Default coin price

    async function initialize() {
        coinPrice = await fetchDynamicCoinPrice(); // Fetch dynamic coin price
        updateBalances();
        updateWeeklyReward();
    }

    // Connect wallet
    connectWalletButton.addEventListener("click", async () => {
        const walletConnected = await connectWallet();
        if (walletConnected) {
            const walletAddress = document.getElementById("wallet-address").innerText.split(" ")[1];
            if (walletAddress && playerBalance === 0) {
                playerBalance = 20; // Grant 20 coins for first-time connection
                updateBalances();
                resultMessage.textContent = "✅ Wallet connected and 20 coins credited!";
            }
        } else {
            resultMessage.textContent = "⚠️ Wallet connection failed. Please try again.";
        }
    });

    // Spin function
    async function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Not enough coins! Please deposit more coins.";
            return;
        }

        spinButton.disabled = true;
        resultMessage.textContent = "";
        playerBalance--;
        spins++;

        const slots = document.querySelectorAll('.slot');
        const icons = [
            'https://i.imgur.com/Xpf9bil.png',
            'https://i.imgur.com/toIiHGF.png',
            'https://i.imgur.com/tuXO9tn.png',
            'https://i.imgur.com/7XZCiRx.png',
            'https://i.imgur.com/7N2Lyw9.png', // Winning icon
            'https://i.imgur.com/OazBXaj.png',
            'https://i.imgur.com/bIBTHd0.png',
            'https://i.imgur.com/PTrhXRa.png',
            'https://i.imgur.com/cAkESML.png'
        ];

        let spinResults = [];
        slots.forEach((slot) => {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            slot.style.backgroundImage = `url(${randomIcon})`;
            spinResults.push(randomIcon);
        });

        const winIcon = 'https://i.imgur.com/7N2Lyw9.png';
        const winCount = spinResults.filter(icon => icon === winIcon).length;
        let winAmount = 0;

        if (winCount === 1) winAmount = 1;
        else if (winCount === 2) winAmount = 5;
        else if (winCount === 3) winAmount = 100;

        if (winAmount > 0) {
            const walletAddress = document.getElementById("wallet-address").innerText.split(" ")[1];
            if (walletAddress) {
                await transferSpinReward(walletAddress, winAmount);
            }
            temporaryBalance += winAmount;
            resultMessage.textContent = `🎉 Congratulations! You won ${winAmount} coins! 🎉`;
        } else {
            resultMessage.textContent = "No win this time. Try again!";
        }

        updateBalances();
        spinButton.disabled = false;
    }

    // Update balances
    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Spins: ${spins}`;
    }

    // Update weekly reward display
    function updateWeeklyReward() {
        const houseWalletBalance = 1000000; // Example house wallet balance
        const weeklyReward = houseWalletBalance * 0.1; // 10% of house wallet
        weeklyRewardDisplay.textContent = `Weekly Reward Pool: ${weeklyReward} Coins ($${(weeklyReward * coinPrice).toFixed(2)})`;
    }

    // Deposit Coins Button
    depositButton.addEventListener("click", () => {
        const depositAddress = "5dA8kKepycbZ43Zm3MuzRGro5KkkzoYusuqjz8MfTBwn"; // Test wallet address
        const max
