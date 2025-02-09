let isSpinning = false; // Tanımlama eklendi

function spinGame() {
    if (isSpinning) return; // Spin sırasında tekrar çalışmaz
    isSpinning = true;

    const spinButton = document.getElementById("spin-button");
    spinButton.disabled = true;
    const resultMessage = document.getElementById("result-message");
    resultMessage.textContent = "🎰 Spinning...";

    const slots = document.querySelectorAll(".slot");
    const slotImages = [
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
                    isSpinning = false;
                    spinButton.disabled = false;
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
        const slots = document.querySelectorAll(".slot");
        slots.forEach((slot, index) => {
            if (spinResults[index] === winIcon) {
                slot.classList.add("winning-slot");
            }
        });
    }

    const resultMessage = document.getElementById("result-message");
    if (winCount === 3) {
        resultMessage.textContent = "🎉 Jackpot! You won 100 coins!";
    } else if (winCount === 2) {
        resultMessage.textContent = "🎉 You matched 2 symbols and won 5 coins!";
    } else if (winCount === 1) {
        resultMessage.textContent = "🎉 You matched 1 symbol and won 1 coin!";
    } else {
        resultMessage.textContent = "❌ No match, better luck next time!";
    }
}
