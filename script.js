window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const walletIcon = document.getElementById("connect-wallet-icon");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    let playerBalance = 0; // Oyuncunun başlangıç bakiyesi
    const coinPrice = 0.000005775; // Coin fiyatı

    // Phantom Wallet bağlantısı
    async function connectWallet() {
        try {
            const wallet = window.solana;
            if (!wallet || !wallet.isPhantom) {
                alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
                return;
            }

            const response = await wallet.connect();
            const walletAddress = response.publicKey.toString();
            document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;

            // İlk bağlantı bonusu
            if (playerBalance === 0) {
                playerBalance = 20; // İlk kez bağlanan oyuncuya 20 coin eklenir
                updateBalances();
            }
        } catch (error) {
            console.error("Cüzdan bağlantısı başarısız oldu:", error);
            alert("Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
        }
    }

    // Spin işlemi
    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın veya transfer edin.";
            return;
        }

        spinButton.disabled = true; // Spin butonunu geçici olarak devre dışı bırak
        resultMessage.textContent = ""; // Mesajı temizle
        playerBalance--; // Bakiyeden 1 coin düş

        // Spin mekaniği
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

        // Kazanç hesaplama
        const winIcon = 'https://i.imgur.com/7N2Lyw9.png'; // Kazanan ikon
        const winCount = spinResults.filter(icon => icon === winIcon).length;
        let winAmount = 0;
        if (winCount === 1) winAmount = 1;
        else if (winCount === 2) winAmount = 5;
        else if (winCount === 3) winAmount = 100;

        if (winAmount > 0) {
            playerBalance += winAmount;
            resultMessage.textContent = `Tebrikler! ${winAmount} coin kazandınız!`;
        } else {
            resultMessage.textContent = "Tekrar deneyin! Bu sefer coin kazanamadınız.";
        }

        updateBalances();
        spinButton.disabled = false; // Spin butonunu tekrar aktif et
    }

    // Bakiye güncelleme
    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    // Wallet ikonuna tıklayınca bağlanma işlemini başlat
    walletIcon.addEventListener("click", connectWallet);

    // Spin butonuna tıklayınca spin işlemini başlat
    spinButton.addEventListener("click", spin);

    updateBalances(); // Başlangıçta bakiye gösterimini güncelle
};
