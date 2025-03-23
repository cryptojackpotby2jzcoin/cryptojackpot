let isSpinning = false;

function spinGame(winnings) {
  if (isSpinning) return;
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

  const winCount = winnings === 100 ? 3 : winnings === 5 ? 2 : winnings === 1 ? 1 : 0;

  slots.forEach((slot, index) => {
    let totalSpins = slotImages.length * 12;
    let currentSpin = 0;

    function animateSpin() {
      if (currentSpin < totalSpins) {
        const randomIcon = slotImages[Math.floor(Math.random() * slotImages.length)];
        slot.style.backgroundImage = `url(${randomIcon})`;
        currentSpin++;
        setTimeout(animateSpin, 50);
      } else {
        const finalIcon = (index < winCount) ? slotImages[4] : slotImages[Math.floor(Math.random() * (slotImages.length - 1))];
        slot.style.backgroundImage = `url(${finalIcon})`;
        spinResults.push(finalIcon);
        animationCompleteCount++;

        if (animationCompleteCount === slots.length) {
          evaluateSpin(winnings);
          isSpinning = false;
          spinButton.disabled = false;
          window.dispatchEvent(new Event("spinComplete"));
        }
      }
    }
    animateSpin();
  });
}

function evaluateSpin(winnings) {
  const resultMessage = document.getElementById("result-message");
  if (winnings === 100) {
    resultMessage.textContent = "🎉 Jackpot! You won 100 coins!";
  } else if (winnings === 5) {
    resultMessage.textContent = "🎉 You matched 2 symbols and won 5 coins!";
  } else if (winnings === 1) {
    resultMessage.textContent = "🎉 You matched 1 symbol and won 1 coin!";
  } else {
    resultMessage.textContent = "❌ No match, better luck next time!";
  }
}
