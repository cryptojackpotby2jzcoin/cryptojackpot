window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const walletButton = document.getElementById("wallet-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const walletAddressDisplay = document.getElementById("wallet-address");

    let playerBalance = 0;
    const coinPrice = 0.000005775;
    let walletAddress = "N/A";

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
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
            return;
        }

        try {
            const response = await window.solana.connect();
            walletAddress = response.publicKey.toString();
            walletAddressDisplay.innerText = `Wallet: ${walletAddress}`;
            playerBalance = 20;
            updateBalances();
            alert("Cüzdan başarıyla bağlandı ve 20 coin eklendi!");
        } catch (error) {
            console.error("Cüzdan bağlantısı başarısız oldu:", error);
            alert("Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
        }
    }

    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin!";
            return;
        }

        if (walletAddress === "N/A") {
            alert("Lütfen önce cüzdanınızı bağlayın!");
            return;
        }

        spinButton.disabled = true;
        resultMessage.textContent = "";
        playerBalance--;

        const slots = document.querySelectorAll('.slot');
        let spinResults = [];
        slots.forEach(slot => {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            slot.style.backgroundImage = `url(${randomIcon})`;
            spinResults.push(randomIcon);
        });

        const winIcon = 'https://i.imgur.com/7N2Lyw9.png';
        const winCount = spinResults.filter(icon => icon === winIcon).length;
        let winAmount = winCount === 1 ? 1 : winCount === 2 ? 5 : winCount === 3 ? 100 : 0;

        if (winAmount > 0) {
            playerBalance += winAmount;
            resultMessage.textContent = `Tebrikler! ${winAmount} coin kazandınız!`;
        } else {
            resultMessage.textContent = "Kazanamadınız, tekrar deneyin!";
        }

        updateBalances();
        spinButton.disabled = false;
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    walletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    updateBalances();
};
