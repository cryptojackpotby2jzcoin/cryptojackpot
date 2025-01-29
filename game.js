window.onload = async function () {
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    let playerBalance = 0;
    const coinPrice = 0.000005775;

    async function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Yetersiz coin! Lütfen daha fazla coin yatırın.";
            return;
        }

        spinButton.disabled = true;
        resultMessage.textContent = "";
        playerBalance--;

        const slots = document.querySelectorAll(".slot");
        const icons = [
            "https://i.imgur.com/Xpf9bil.png",
            "https://i.imgur.com/toIiHGF.png",
            "https://i.imgur.com/tuXO9tn.png",
            "https://i.imgur.com/7XZCiRx.png",
            "https://i.imgur.com/7N2Lyw9.png", // Kazanan ikon
            "https://i.imgur.com/OazBXaj.png",
            "https://i.imgur.com/bIBTHd0.png",
            "https://i.imgur.com/PTrhXRa.png",
            "https://i.imgur.com/cAkESML.png"
        ];

        let spinResults = [];
        slots.forEach((slot) => {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            slot.style.backgroundImage = `url(${randomIcon})`;
            spinResults.push(randomIcon);
        });

        const winIcon = "https://i.imgur.com/7N2Lyw9.png";
        const winCount = spinResults.filter((icon) => icon === winIcon).length;
        let winAmount = 0;

        if (winCount === 1) winAmount = 1;
        else if (winCount === 2) winAmount = 5;
        else if (winCount === 3) winAmount = 100;

        if (winAmount > 0) {
            playerBalance += winAmount;
            resultMessage.textContent = `Tebrikler! ${winAmount} coin kazandınız!`;
        } else {
            resultMessage.textContent = "Bu sefer coin kazanamadınız. Şansınızı tekrar deneyin!";
        }

        updateBalances();
        spinButton.disabled = false;
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    spinButton.addEventListener("click", spin);
    updateBalances();
};
