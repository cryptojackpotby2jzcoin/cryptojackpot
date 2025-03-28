let totalSpins = 0;
let spinCounter = 0;

window.addEventListener("spinComplete", function () {
    totalSpins++;
    spinCounter++;
    document.getElementById("total-spins").innerText = totalSpins;
    document.getElementById("spin-counter").innerText = spinCounter;
});
