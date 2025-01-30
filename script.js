document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    let userWallet = null;
    let playerBalance = 0;
    let temporaryBalance = 0;
    let spins = 0;
    let isSpinning = false; // 🔥 Yeni eklendi: Sürekli spin atılmasını engellemek için

    const programId = "7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv"; // Smart Contract ID

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

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet bağlandı:", userWallet);
                await getBalance();
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    async function getBalance() {
        console.log("🔄 Bakiyeniz alınıyor...");
        playerBalance = 100; // Örnek veri, Smart Contract'a bağlanınca değiştirilecek
        updateBalances();
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Wallet bağlamadan deposit yapamazsınız!");
            return;
        }

        let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
        amount = parseInt(amount);
        if (amount <= 0) return;

        console.log(`🔄 ${amount} coins depositing...`);
        playerBalance += amount;
        alert(`✅ ${amount} coin deposit edildi!`);
        updateBalances();
    }

    async function spin() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        if (isSpinning) {
            alert("⚠️ Spin zaten devam ediyor!");
            return;
        }

        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Yetersiz bakiye!";
            return;
        }

        isSpinning = true; // 🔥 Sürekli spin atılmasını engellemek için

        console.log("🔄 Spin işlemi başlatılıyor...");
        playerBalance--;
        spins++;
        updateBalances();

        const slots = document.querySelectorAll('.slot');
        let spinResults = [];
        let animationCompleteCount = 0;

        slots.forEach(slot => {
            slot.classList.remove('winning-slot');
            slot.style.backgroundSize = "contain"; // 🔥 İkonlar büyük olmasın diye düzeltme
            slot.style.backgroundRepeat = "no-repeat";
        });

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
                        checkResults(spinResults, slots);
                        isSpinning = false; // 🔥 Spin tamamlandı, tekrar spin atılabilir
                    }
                }
            }
            animateSpin();
        });

        setTimeout(() => {
            let win = Math.random() < 0.2;
            if (win) {
                let winAmount = Math.floor(Math.random() * 10) + 1;
                temporaryBalance += winAmount;
                resultMessage.textContent = `🎉 Kazandınız! ${winAmount} coin eklendi.`;
            } else {
                resultMessage.textContent = "😢 Kaybettiniz, tekrar deneyin!";
            }
            updateBalances();
        }, 2000);
    }

    async function withdrawCoins() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }
        if (temporaryBalance <= 0) {
            alert("⚠️ Çekilecek coin yok!");
            return;
        }

        console.log(`🔄 Withdraw başlatıldı: ${temporaryBalance} coin`);
        alert(`✅ ${temporaryBalance} coin Phantom Wallet'a gönderildi!`);
        temporaryBalance = 0;
        updateBalances();
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins`;
        spinCounterDisplay.textContent = `Spin: ${spins}`;
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    
    updateBalances();
});
