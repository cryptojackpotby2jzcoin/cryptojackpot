window.onload = async function () {
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    let playerBalance = 20; // Oyuncunun başlangıç bakiyesi
    let earnedCoins = 0; // Kazanılan coinler
    let spinCount = 0; // Yapılan toplam spin sayısı
    const coinPrice = 0.000005775; // Coin fiyatı

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

    async function connectWallet() {
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
            return;
        }

        try {
            const response = await window.solana.connect();
            const walletAddress = response.publicKey.toString();
            document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
        } catch (error) {
            console.error("Cüzdan bağlantısı başarısız oldu:", error);
            alert("Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
        }
    }

    async function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın veya transfer edin.";
            return;
        }

        spinButton.disabled = true; // Spin butonunu geçici olarak devre dışı bırak
        resultMessage.textContent = ""; // Mesajı temizle
        playerBalance--; // Bakiyeden 1 coin düş
        spinCount++; // Spin sayısını artır

        const slots = document.querySelectorAll('.slot');
        let spinResults = [];
        slots.forEach((slot) => {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            slot.style.backgroundImage = `url(${randomIcon})`;
            spinResults.push(randomIcon);
        });

        const winIcon = 'https://i.imgur.com/7N2Lyw9.png'; // Kazanan ikon
        const winCount = spinResults.filter(icon => icon === winIcon).length;
        let winAmount = 0;
        if (winCount === 1) winAmount = 1;
        else if (winCount === 2) winAmount = 5;
        else if (winCount === 3) winAmount = 100;

        if (winAmount > 0) {
            earnedCoins += winAmount;
            resultMessage.textContent = `Tebrikler! ${winAmount} coin kazandınız!`;
        } else {
            resultMessage.textContent = "Tekrar deneyin! Bu sefer coin kazanamadınız.";
        }

        updateBalances();
        spinButton.disabled = false; // Spin butonunu tekrar aktif et
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins ($${(earnedCoins * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Spins: ${spinCount}`;
    }

    spinButton.addEventListener("click", spin);
    updateBalances();
};
