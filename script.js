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

    let playerBalance = 0; // Oyuncunun başlangıç bakiyesi
    let temporaryBalance = 0; // Kazanılan coinler
    let spins = 0; // Yapılan toplam spin sayısı
    const coinPrice = 0.000005775; // Coin fiyatı

    // Cüzdan bağlantısı
    connectWalletButton.addEventListener("click", async () => {
        const walletConnected = await connectWallet();
        if (walletConnected) {
            const walletAddress = document.getElementById("wallet-address").innerText.split(" ")[1];
            if (walletAddress && playerBalance === 0) {
                playerBalance = 20; // İlk kez bağlanan kullanıcı için 20 coin ekle
                updateBalances();
                resultMessage.textContent = "✅ Cüzdan bağlandı ve 20 coin yüklendi!";
            }
        } else {
            resultMessage.textContent = "⚠️ Cüzdan bağlantısı başarısız oldu. Lütfen tekrar deneyin.";
        }
    });

    // Spin işlemi
    async function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın.";
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
            const walletAddress = document.getElementById("wallet-address").innerText.split(" ")[1];
            if (walletAddress) {
                await transferSpinReward(walletAddress, winAmount);
            }
            temporaryBalance += winAmount;
            resultMessage.textContent = `🎉 Tebrikler! ${winAmount} coin kazandınız! 🎉`;
        } else {
            resultMessage.textContent = "Bu sefer coin kazanamadınız. Şansınızı tekrar deneyin!";
        }

        updateBalances();
        spinButton.disabled = false;
    }

    // Bakiye güncellemeleri
    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Spins: ${spins}`;
    }

    // Deposit Coins Butonu
    depositButton.addEventListener("click", () => {
        const depositAddress = "5dA8kKepycbZ43Zm3MuzRGro5KkkzoYusuqjz8MfTBwn"; // Test cüzdan adresi
        const maxDepositAmount = 100;
        const coinCA = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump";

        const solanaPayUrl = `solana:${depositAddress}?amount=${maxDepositAmount}&token=${coinCA}&label=Crypto%20Jackpot&message=Deposit%20for%20game%20balance`;
        window.open(solanaPayUrl, "_blank");
    });

    // Withdraw Coins Butonu
    withdrawButton.addEventListener("click", async () => {
        const walletAddress = document.getElementById("wallet-address").innerText.split(" ")[1];
        if (walletAddress) {
            await transferSpinReward(walletAddress, temporaryBalance); // Tüm kazanılan coinleri çek
            temporaryBalance = 0; // Kazanılan coinler sıfırlanır
            resultMessage.textContent = "✅ Coinler cüzdanınıza aktarıldı!";
        } else {
            resultMessage.textContent = "⚠️ Önce cüzdan bağlamalısınız!";
        }
        updateBalances();
    });

    // Spin Butonu
    spinButton.addEventListener("click", spin);

    // İlk bakiye güncellemesi
    updateBalances();
};
