window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const walletButton = document.getElementById("wallet-button");
    const depositButton = document.getElementById("deposit-button");
    const transferButton = document.getElementById("transfer-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const walletAddressDisplay = document.getElementById("wallet-address");

    let playerBalance = 0; // Oyuncunun başlangıç bakiyesi
    const coinPrice = 0.000005775; // Coin fiyatı
    let walletAddress = "N/A"; // Başlangıçta cüzdan adresi

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
            walletAddress = response.publicKey.toString();
            walletAddressDisplay.innerText = `Wallet: ${walletAddress}`;
            playerBalance = 20; // İlk kez bağlanan oyuncuya 20 coin
            updateBalances();
            alert("Cüzdan başarıyla bağlandı ve 20 coin eklendi!");
        } catch (error) {
            console.error("Cüzdan bağlantısı başarısız oldu:", error);
            alert("Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
        }
    }

    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın veya transfer edin.";
            return;
        }

        if (walletAddress === "N/A") {
            alert("Lütfen önce cüzdanınızı bağlayın!");
            return;
        }

        spinButton.disabled = true; // Spin butonunu geçici olarak devre dışı bırak
        resultMessage.textContent = ""; // Mesajı temizle
        playerBalance--; // Bakiyeden 1 coin düş

        const slots = document.querySelectorAll('.slot');
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

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    walletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    updateBalances();
};
