import { connectWallet, transferSpinReward } from './blockchain.js';

window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    let playerBalance = 0;
    let temporaryBalance = 0;
    let spins = 0;

    const coinPrice = 0.000005775;

    // Wallet Bağlantısı
    connectWalletButton.addEventListener("click", async () => {
        const walletAddress = await connectWallet();
        if (walletAddress && playerBalance === 0) {
            playerBalance = 20; // İlk kez bağlanan kullanıcıya 20 coin
            updateBalances();
            resultMessage.textContent = "✅ Cüzdan bağlandı ve 20 coin yüklendi!";
        }
    });

    // Spin Mekanizması
    async function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın.";
            return;
        }

        spinButton.disabled = true;
        playerBalance--;
        spins++;

        const slots = document.querySelectorAll('.slot');
        const icons = [
            'https://i.imgur.com/Xpf9bil.png',
            'https://i.imgur.com/toIiHGF.png',
            'https://i.imgur.com/tuXO9tn.png',
            'https://i.imgur.com/7XZCiRx.png',
            'https://i.imgur.com/7N2Lyw9.png', // Kazanan ikon
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
            temporaryBalance += winAmount;
            resultMessage.textContent = `🎉 Tebrikler! ${winAmount} coin kazandınız! 🎉`;
        } else {
            resultMessage.textContent = "Bu sefer coin kazanamadınız. Şansınızı tekrar deneyin!";
        }

        updateBalances();
        spinButton.disabled = false;
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Spins: ${spins}`;
    }

    spinButton.addEventListener("click", spin);
};
