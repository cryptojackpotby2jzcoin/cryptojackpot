window.onload = async function () {
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");

    let userWallet = null;
    let playerBalance = 0;
    const coinPrice = 0.000009295;

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

    window.getUserBalance = async function () {
        const provider = window.solana;
        if (!provider || !provider.isPhantom) {
            alert("❌ Wallet is not connected!");
            return 0;
        }

        try {
            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
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
            const balance = await window.getUserBalance();
            playerBalance = balance || 0;
            updateBalances();
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

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

        try {
            await window.spinGame();
            await getBalance();
            resultMessage.textContent = "🎉 Spin completed! Check your updated balance.";
        } catch (error) {
            console.error("❌ Spin failed:", error);
            resultMessage.textContent = "❌ Spin failed. Please try again.";
        }
    });

    const withdrawButton = document.getElementById("withdraw-button");
    withdrawButton.addEventListener("click", async () => {
        if (!userWallet) {
            alert("⚠️ Please connect your wallet first!");
            return;
        }

        try {
            await window.withdrawCoins();
            await getBalance();
            alert("💰 Coins withdrawn successfully!");
        } catch (error) {
            console.error("❌ Withdraw failed:", error);
            alert("❌ Withdraw failed. Please try again.");
        }
    });

    await connectWallet();
};
