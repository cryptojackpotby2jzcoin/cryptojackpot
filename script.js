import { initGame } from './blockchain';

window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const resultMessage = document.getElementById("result-message");
    let playerBalance = 0; // Oyuncunun başlangıç bakiyesi
    const coinPrice = 0.000005775; // Coin fiyatı

    async function handleSpin() {
        if (playerBalance === 0) {
            const connected = await initGame(); // Blockchain.js içindeki cüzdan bağlantı fonksiyonu

            if (!connected) {
                alert("Cüzdan bağlanamadığı için spin işlemi yapılamıyor.");
                return;
            }

            playerBalance = 20; // İlk bağlantıda 20 coin eklenir
            updateBalances();
        }

        spin();
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Insufficient coins! Deposit or transfer more coins.";
            return;
        }

        playerBalance--;
        updateBalances();
        resultMessage.textContent = "Spinning... Good luck!";
        setTimeout(() => {
            resultMessage.textContent = "Try again! No coins won this time.";
        }, 2000);
    }

    spinButton.addEventListener("click", handleSpin);
    updateBalances();
};
