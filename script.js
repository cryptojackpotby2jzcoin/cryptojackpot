document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const depositButton = document.getElementById("deposit-button");
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const withdrawButton = document.getElementById("withdraw-button");    
    const playerBalanceDisplay = document.getElementById("player-balance");
    const slots = document.querySelectorAll(".slot");

    const slotImages = [
        "https://i.imgur.com/Xpf9bil.png",
        "https://i.imgur.com/toIiHGF.png",
        "https://i.imgur.com/tuXO9tn.png",
        "https://i.imgur.com/7XZCiRx.png",
        "https://i.imgur.com/7N2Lyw9.png",
        "https://i.imgur.com/OazBXaj.png",
        "https://i.imgur.com/bIBTHd0.png",
        "https://i.imgur.com/PTrhXRa.png",
        "https://i.imgur.com/cAkESML.png"
    ];

    const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF";

    let userWallet = null;
    let playerBalance = 0;
    let spins = 0;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet connected:", userWallet);
                await getBalance();
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Wallet connection failed, please try again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    async function getUserBalance() {
        const provider = window.solana;
        if (!provider || !provider.isPhantom) {
            alert("❌ Wallet is not connected!");
            return 0;
        }

        try {
            const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
            const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

            const accounts = await connection.getParsedTokenAccountsByOwner(
                provider.publicKey,
                { programId: TOKEN_PROGRAM_ID }
            );

            if (accounts.value.length > 0) {
                const balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                console.log(`🔄 Current balance: ${balance}`);
                return balance;
            } else {
                console.log("⚠️ No balance found!");
                return 0;
            }
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
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
    }

    async function spinGame() {
        console.log("🎰 Spin function executed.");

        slots.forEach(slot => slot.classList.remove('winning-slot'));

        let spinResults = [];
        let animationCompleteCount = 0;

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

        if (winCount === 3) {
            playerBalance += 100;
            resultMessage.textContent = "🎉 Jackpot! You won 100 coins!";
        } else if (winCount === 2) {
            playerBalance += 5;
            resultMessage.textContent = "🎉 You matched 2 symbols and won 5 coins!";
        } else if (winCount === 1) {
            playerBalance += 1;
            resultMessage.textContent = "🎉 You matched 1 symbol and won 1 coin!";
        } else {
            resultMessage.textContent = "❌ No match, better luck next time!";
        }

        updateBalances();
    }

    async function withdrawCoins() {
        console.log("💰 Withdraw function executed.");
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        try {
            const connection = new solanaWeb3.Connection("https://rpc.helius.xyz/?api-key=d1c5af3f-7119-494d-8987-cd72bc00bfd0", "confirmed");
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(houseWalletAddress),
                    toPubkey: new solanaWeb3.PublicKey(userWallet),
                    lamports: playerBalance * solanaWeb3.LAMPORTS_PER_SOL / 1000 
                })
            );
            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature);
            alert("💰 Coins withdrawn successfully!");
            playerBalance = 0;
            updateBalances();
        } catch (error) {
            console.error("❌ Withdraw failed:", error);
            alert("❌ Withdraw failed. Please try again.");
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", async () => {
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Insufficient balance!";
            return;
        }

        resultMessage.textContent = "🎰 Spinning...";
        playerBalance--;

        try {
            await spinGame();
        } catch (error) {
            console.error("❌ Spin failed:", error);
            resultMessage.textContent = "❌ Spin failed. Please try again.";
        }
    });

    withdrawButton.addEventListener("click", withdrawCoins);
    depositButton.addEventListener("click", () => alert("Deposit feature is not defined yet."));

    connectWallet();
});
