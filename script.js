import { connectWallet, transferSpinReward } from './blockchain.js';

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

    let playerBalance = 0;
    let temporaryBalance = 0;
    let spins = 0;
    const coinPrice = 0.000005775;

    // Wallet bağlantısı
    connectWalletButton.addEventListener("click", async () => {
        const walletConnected = await connectWallet();
        if (walletConnected) {
            playerBalance = 20;
            updateBalances();
            resultMessage.textContent = "✅ Wallet connected. 20 coins added!";
        } else {
            resultMessage.textContent = "⚠️ Wallet connection failed. Please try again.";
        }
    });

    // Spin işlemi
    async function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "⚠️ Insufficient balance! Deposit more coins.";
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
            'https://i.imgur.com/7N2Lyw9.png', 
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
            temporaryBalance += winAmount;
            resultMessage.textContent = `🎉 You won ${winAmount} coins! 🎉`;
        } else {
            resultMessage.textContent = "No luck this time. Try again!";
        }

        updateBalances();
        spinButton.disabled = false;
    }

    // Bakiye güncellemeleri
    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Total Spins: ${spins}`;
    }

    // Deposit işlemi
    depositButton.addEventListener("click", () => {
        const depositUrl = `solana:YOUR_HOUSE_WALLET?amount=100&token=YOUR_TOKEN_ADDRESS&label=Deposit`;
        window.open(depositUrl, "_blank");
    });

    // Withdraw işlemi
    withdrawButton.addEventListener("click", () => {
        resultMessage.textContent = "✅ Coins successfully withdrawn!";
    });

    // Spin butonu
    spinButton.addEventListener("click", spin);

    updateBalances();
};
