function spinGame() {
    if (isSpinning) return;
    isSpinning = true;
    spinButton.disabled = true;
    resultMessage.textContent = "🎰 Spinning...";

    let spinResults = [];
    let animationCompleteCount = 0;

    slots.forEach(slot => slot.classList.remove("winning-slot"));

    slots.forEach((slot) => {
        let totalSpins = slotImages.length * 8;
        let currentSpin = 0;

        function animateSpin() {
            if (currentSpin < totalSpins) {
                const randomIcon = slotImages[Math.floor(Math.random() * slotImages.length)];
                slot.style.backgroundImage = `url(${randomIcon})`;
                currentSpin++;
                setTimeout(animateSpin, 50);
            } else {
                const finalIcon = slotImages[Math.floor(Math.random() * slotImages.length)];
                slot.style.backgroundImage = `url(${finalIcon})`;
                spinResults.push(finalIcon);
                animationCompleteCount++;

                if (animationCompleteCount === slots.length) {
                    evaluateSpin(spinResults);
                    spins++;
                    updateBalances();
                    spinButton.disabled = false;
                    isSpinning = false;
                }
            }
        }
        animateSpin();
    });
}

function evaluateSpin(spinResults) {
    const winIcon = "https://i.imgur.com/7N2Lyw9.png";
    const winCount = spinResults.filter(icon => icon === winIcon).length;

    if (winCount > 0) {
        slots.forEach((slot, index) => {
            if (spinResults[index] === winIcon) {
                slot.classList.add("winning-slot");
            }
        });
    }

    if (winCount === 3) {
        earnedCoins += 100;
        resultMessage.textContent = "🎉 Jackpot! You won 100 coins!";
    } else if (winCount === 2) {
        earnedCoins += 5;
        resultMessage.textContent = "🎉 You matched 2 symbols and won 5 coins!";
    } else if (winCount === 1) {
        earnedCoins += 1;
        resultMessage.textContent = "🎉 You matched 1 symbol and won 1 coin!";
    } else {
        resultMessage.textContent = "❌ No match, better luck next time!";
    }
}

