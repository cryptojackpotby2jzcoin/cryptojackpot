import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; 
const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF"; 

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

    let playerBalance = 20;
    let temporaryBalance = 0;
    let spins = 0;
    const coinPrice = 0.000005775;

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

        spinButton.disabled = true;
        resultMessage.textContent = "";
        playerBalance--;
        spins++;

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
                        checkResults(spinResults, slots);
                        spinButton.disabled = false;
                    }
                }
            }
            animateSpin();
        });

        updateBalances();
    }

    function checkResults(spinResults, slots) {
        const winIcon = 'https://i.imgur.com/7N2Lyw9.png';
        const winCount = spinResults.filter(icon => icon === winIcon).length;
        let winAmount = winCount === 1 ? 1 : winCount === 2 ? 5 : winCount === 3 ? 100 : 0;

        if (winAmount > 0) {
            temporaryBalance += winAmount;
            resultMessage.textContent = `💰 Congratulations! You won ${winAmount} coins! 💰`;

            spinResults.forEach((icon, index) => {
                if (icon === winIcon) {
                    slots[index].classList.add('winning-slot');
                }
            });
        } else {
            resultMessage.textContent = "Try again! No coins won this time.";
        }

        updateBalances();
    }

    // Phantom Wallet Bağlantısı
    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                const walletAddress = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
                console.log("✅ Wallet bağlandı:", walletAddress);
                return walletAddress;
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
                return null;
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
            return null;
        }
    }

    // Solana Pay ile Bağlantı (Telegram için)
    function generateSolanaPayUrl(walletAddress, amount, label, message) {
        return `solana:${walletAddress}?amount=${amount}&token=${coinAddress}&label=${encodeURIComponent(label)}&message=${encodeURIComponent(message)}`;
    }

    async function connectWalletViaSolanaPay() {
        try {
            const solanaPayUrl = generateSolanaPayUrl(houseWalletAddress, 0, "Connect Wallet", "Connect your Phantom Wallet");

            document.getElementById("wallet-address").innerHTML = `
                Wallet: Connecting... <br>
                <a href="${solanaPayUrl}" target="_blank">Phantom Wallet'ı Aç</a>
            `;

            console.log("🟡 Phantom Wallet açılıyor:", solanaPayUrl);
        } catch (error) {
            console.error("❌ Solana Pay bağlantısı başarısız oldu:", error);
            alert("Solana Pay bağlantısı başarısız oldu.");
        }
    }

    connectWalletButton.addEventListener("click", async () => {
        const wallet = await connectWallet();
        if (!wallet) {
            console.log("Solana Pay ile bağlanmayı deniyoruz...");
            await connectWalletViaSolanaPay();
        }
    });

    depositButton.addEventListener("click", () => {
        const solanaPayUrl = generateSolanaPayUrl(houseWalletAddress, 100, "Deposit Coins", "Deposit your 2JZ coins for gameplay");
        window.open(solanaPayUrl, "_blank");
    });

    withdrawButton.addEventListener("click", () => {
        alert("Withdraw işlemi devreye girdi.");
    });

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

    updateBalances();
};

async function connectWallet() {
    if (!window.solana) {
        alert("Phantom Wallet bulunamadı! Lütfen yükleyin ve tekrar deneyin.");
        return;
    }

    try {
        const response = await window.solana.connect();
        document.getElementById("wallet-address").innerText = `Wallet: ${response.publicKey.toString()}`;
    } catch (error) {
        console.error("Wallet bağlantı hatası:", error);
    }
}

document.getElementById("connect-wallet-button").addEventListener("click", connectWallet);

async function connectWallet() {
    if (!window.solana) {
        alert("Phantom Wallet bulunamadı! Lütfen yükleyin ve tekrar deneyin.");
        return;
    }

    try {
        const response = await window.solana.connect();
        document.getElementById("wallet-address").innerText = `Wallet: ${response.publicKey.toString()}`;
    } catch (error) {
        console.error("Wallet bağlantı hatası:", error);
    }
}

document.getElementById("connect-wallet-button").addEventListener("click", connectWallet);

function updateBalances() {
    document.getElementById("player-balance").textContent = `Your Balance: ${playerBalance} Coins`;
    document.getElementById("earned-coins").textContent = `Earned Coins: ${temporaryBalance} Coins`;
}

updateBalances();

