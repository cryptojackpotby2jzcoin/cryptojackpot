document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");

    const heliusApiKey = "d1c5af3f-7119-494d-8987-cd72bc00bfd0"; // API key
    const programId = new solanaWeb3.PublicKey("Dernj3xEN3a9UPGXdosdHTmnT5N97uRCEyDQ3cS7ftbe");
    const houseWalletAddress = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");
    let userWallet = null;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey;
                console.log("✅ Wallet connected:", userWallet.toString());
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet.toString()}`;
                await updateBalance();
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Please connect your wallet again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    async function updateBalance() {
        if (userWallet) {
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const balance = await connection.getBalance(userWallet);
            document.getElementById("player-balance").innerText = `Your Balance: ${balance / solanaWeb3.LAMPORTS_PER_SOL} Coins`;
        }
    }

    async function depositCoins() {
        const amount = parseFloat(prompt("Enter the number of coins to deposit (max 10,000):"));
        if (amount <= 0 || amount > 10000 || isNaN(amount)) {
            alert("❌ Invalid deposit amount!");
            return;
        }

        try {
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const lamports = BigInt(Math.floor(amount * solanaWeb3.LAMPORTS_PER_SOL));
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: userWallet,
                    toPubkey: houseWalletAddress,
                    lamports: lamports,
                })
            );
            const signature = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");
            alert(`✅ Successfully deposited ${amount} coins!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Deposit failed:", error);
            alert("❌ Deposit failed. Please try again.");
        }
    }

    async function withdrawCoins() {
        const amount = parseFloat(prompt("Enter the number of coins to withdraw:"));
        if (isNaN(amount) || amount <= 0) {
            alert("❌ Invalid withdrawal amount!");
            return;
        }

        try {
            // Withdraw işlemi için akıllı sözleşme çağrısı yapılmalı, burada sadece bir örnek gösterilmiştir.
            // Gerçek uygulamada, akıllı sözleşme ile kullanıcı bakiyesini kontrol edip, çekme işlemi gerçekleştirilmelidir.
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const lamports = BigInt(Math.floor(amount * solanaWeb3.LAMPORTS_PER_SOL));
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: houseWalletAddress,
                    toPubkey: userWallet,
                    lamports: lamports,
                })
            );
            const signature = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");
            alert(`✅ Successfully withdrew ${amount} coins!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Withdrawal failed:", error);
            alert("❌ Withdrawal failed. Please try again.");
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
    withdrawButton.addEventListener("click", withdrawCoins);
    depositButton.addEventListener("click", depositCoins);
});
