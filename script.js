document.addEventListener("DOMContentLoaded", function () {
    let totalSpins = 0;
    let spinCounter = 0;

    // spinGameOnChain blockchain.js'de zaten spin'i tetikliyor, burada sadece sayaçları güncelleyelim
    window.addEventListener("spinComplete", function () {
        totalSpins++;
        spinCounter++;
        document.getElementById("total-spins").innerText = totalSpins;
        document.getElementById("spin-counter").innerText = spinCounter;
    });
});
