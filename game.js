window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const transferButton = document.getElementById("transfer-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    let playerBalance = 20; // Oyuncunun başlangıç bakiyesi
    let temporaryBalance = 0; // Kazanılan coinler
    let spins = 0; // Yapılan toplam spin sayısı
    const coinPrice = 0.000005775; // Coin fiyatı (örnek)

    const icons = [
        'https://i.imgur.com/Xpf9bil.png',
        'https://i.imgur.com/toIiHGF.png',
        'https://i.imgur.com/tuXO9tn.png',
        'https://i.imgur.com/7XZCiRx.png',
        'https://i.imgur.com/7N2Lyw9.png',
        'https://i.imgur.com/OazBXaj.png',
        'https://i.imgur.com/bIBTHd0.png',
        'https://i.imgur.com/PTrhXRa.png',
        'https://i.imgur.com/cAkESML.png'
    ];

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Spins: ${spins}`;
    }

    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Insufficient coins! Deposit or transfer more coins.";
            return;
        }

        spinButton.disabled = true; // Spin butonunu geçici olarak devre dışı bırak
        resultMessage.textContent = ""; // Mesajı temizle
        playerBalance--; // Bakiyeden 1 coin düş
        spins++; // Spin sayısını artır

        const slots = document.querySelectorAll('.slot');
        let spinResults = [];
        let animationCompleteCount = 0;

        slots.forEach(slot => slot.classList.remove('winning-slot'));
        slots.forEach((slot) => {
            let totalSpins = icons.length * 8;
            let currentSpin = 0;

            function animateSpin() {
                if (currentSpin < totalSpins) {
                    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
                    slot.style.backgroundImage = `url(${randomIcon})`;
                    currentSpin++;
                    setTimeout(animateSpin, 50);
                } else {
                    const finalIcon = icons[Math.floor(Math.random() * icons.length)];
                    slot.style.backgroundImage = `url(${finalIcon})`;
                    spinResults.push(finalIcon);
                    animationCompleteCount++;

                    if (animationCompleteCount === slots.length) {
                        checkResults(spinResults);
                        spinButton.disabled = false; // Spin butonunu tekrar aktif et
                    }
                }
            }
            animateSpin();
        });

        updateBalances();
    }

    function checkResults(spinResults) {
        const winIcon = 'https://i.imgur.com/7N2Lyw9.png'; // Kazanan ikon
        const winCount = spinResults.filter(icon => icon === winIcon).length;
        let winAmount = winCount === 1 ? 1 : winCount === 2 ? 5 : winCount === 3 ? 100 : 0;

        if (winAmount > 0) {
            temporaryBalance += winAmount;
            resultMessage.textContent = `💰 Congratulations! You won ${winAmount} coins! 💰`;
        } else {
            resultMessage.textContent = "Try again! No coins won this time.";
        }

        updateBalances();
    }

    // Deposit Coins Butonu
    depositButton.addEventListener("click", () => {
        const depositAddress = "5dA8kKepycbZ43Zm3MuzRGro5KkkzoYusuqjz8MfTBwn"; // Test cüzdan adresi
        const maxDepositAmount = 100; // Maksimum yatırılabilecek coin miktarı (opsiyonel)
        const coinCA = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; // 2JZ Coin Contract Address

        const solanaPayUrl = `solana:${depositAddress}?amount=${maxDepositAmount}&token=${coinCA}&label=Crypto%20Jackpot&message=Deposit%20for%20game%20balance`;

        window.open(solanaPayUrl, "_blank");
    });

    // Coin çekme işlemi
    withdrawButton.addEventListener("click", () => {
        alert("Withdraw işlemi devreye girdi.");
        // Withdraw işlemi burada uygulanacak
    });

    // Coin transfer işlemi
    transferButton.addEventListener("click", () => {
        if (temporaryBalance > 0) {
            playerBalance += temporaryBalance;
            temporaryBalance = 0;
            resultMessage.textContent = "Coins transferred to your main balance!";
            updateBalances();
        } else {
            resultMessage.textContent = "No coins to transfer!";
        }
    });

    spinButton.addEventListener("click", spin);
};
