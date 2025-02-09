// script.js dosyanızın en üstüne ekleyin
window.Buffer = window.Buffer || require("buffer").Buffer;

document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const transferButton = document.getElementById("transfer-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");
    const weeklyRewardDisplay = document.getElementById("weekly-reward");
    const slots = document.querySelectorAll(".slot");

    const programId = "8ZJJj82MrZ9LRq3bhoRHp8wrFPjqf8dZM5CuXnptJa5S";
    const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF";
    const heliusApiKey = "d1c5af3f-7119-494d-8987-cd72bc00bfd0";

    const slotImages = [
        "https://i.imgur.com/Xpf9bil.png",
        "https://i.imgur.com/toIiHGF.png",
        "https://i.imgur.com/tuXO9tn.png",
        "https://i.imgur.com/7XZCiRx.png",
        "https://i.imgur.com/7N2Lyw9.png", // Win Icon
        "https://i.imgur.com/OazBXaj.png",
        "https://i.imgur.com/bIBTHd0.png",
        "https://i.imgur.com/PTrhXRa.png",
        "https://i.imgur.com/cAkESML.png"
    ];

    let userWallet = null;
    let playerBalance = 0;
    let earnedCoins = 0;
    let spins = 0;
    let isSpinning = false;

    async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            userWallet = response.publicKey.toString();
            document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
            console.log("✅ Wallet connected:", userWallet);
            await getBalance();
            await updateHouseBalance();
        } catch (error) {
            console.error("❌ Wallet connection failed:", error);
            alert("Wallet connection failed, please try again.");
        }
    } else {
        alert("Phantom Wallet not found. Please install it and try again.");
    }
}

   async function updateHouseBalance() {
    try {
        const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
        const balance = await connection.getBalance(new solanaWeb3.PublicKey(houseWalletAddress));
        const coins = balance / solanaWeb3.LAMPORTS_PER_SOL;
        weeklyRewardDisplay.textContent = `Weekly Reward Pool: ${coins.toFixed(2)} Coins ($${(coins * 0.005).toFixed(2)})`;
    } catch (error) {
        console.error("❌ Error fetching house balance:", error);
    }
}

    async function getUserBalance() {
        try {
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const balance = await connection.getBalance(new solanaWeb3.PublicKey(userWallet));
            return balance / solanaWeb3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
            return 0;
        }
    }

    async function getBalance() {
        try {
            const balance = await getUserBalance();
            playerBalance = balance || 0;
            updateBalances();
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance.toFixed(2)} Coins`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${earnedCoins} Coins`;
        spinCounterDisplay.textContent = spins;
    }

    async function depositCoins() {
    if (!userWallet) {
        alert("⚠️ Please connect your wallet first!");
        return;
    }

    const amount = prompt("Enter the number of coins to deposit (max 10,000):");
    if (!amount || isNaN(amount) || amount <= 0 || amount > 10000) {
        alert("❌ Invalid deposit amount!");
        return;
    }

    const lamports = amount * solanaWeb3.LAMPORTS_PER_SOL / 1000;

    try {
        const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(userWallet),
                toPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                lamports: lamports
            })
        );

        const { signature } = await window.solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature, "confirmed");

        playerBalance += parseInt(amount);
        alert(`✅ Successfully deposited ${amount} coins!`);
        updateBalances();
    } catch (error) {
        console.error("❌ Deposit failed:", error);
        alert("❌ Deposit failed. Please try again.");
    }
}

        const { signature } = await window.solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature, "confirmed");

        playerBalance += amount; // Oyuncu bakiyesini artır
        alert(`✅ Successfully deposited ${amount} coins to your game balance!`);
        updateBalances();
    } catch (error) {
        console.error("❌ Deposit failed:", error);
        alert("❌ Deposit failed. Please try again.");
    }
}

        // Wallet ile imzalama
        const { signature } = await window.solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature, "confirmed");

        playerBalance += amount; // Oyuncu bakiyesini artır.
        alert(`✅ Successfully deposited ${amount} coins to your game balance!`);
        updateBalances();
    } catch (error) {
        console.error("❌ Deposit failed:", error);
        alert("❌ Deposit failed. Please try again.");
    }
}


    async function withdrawCoins() {
        alert("Withdraw feature will transfer earned coins to your wallet.");
    }

    async function transferCoins() {
        if (earnedCoins > 0) {
            playerBalance += earnedCoins;
            earnedCoins = 0;
            updateBalances();
            alert("Coins transferred to your main balance!");
        } else {
            alert("No coins to transfer!");
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spinGame);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    transferButton.addEventListener("click", transferCoins);

    connectWallet();
});

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

    updateBalances();
}

