const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const coinAddress = "GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"; 
const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF"; 

document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const depositButton = document.getElementById("deposit-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const transferButton = document.getElementById("transfer-button");
    const spinButton = document.getElementById("spin-button");

    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const resultMessage = document.getElementById("result-message");

    let playerBalance = 20;
    let temporaryBalance = 0;
    let spins = 0;
    const coinPrice = 0.000005775;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                const walletAddress = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
                console.log("✅ Wallet bağlandı:", walletAddress);
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    function generateSolanaPayUrl(walletAddress, amount, label, message) {
        return `solana:${walletAddress}?amount=${amount}&token=${coinAddress}&label=${encodeURIComponent(label)}&message=${encodeURIComponent(message)}`;
    }

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

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
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
                        spinButton.disabled = false;
                    }
                }
            }
            animateSpin();
        });

        updateBalances();
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);

    updateBalances();
});
