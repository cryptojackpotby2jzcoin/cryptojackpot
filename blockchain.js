document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");

    const heliusApiKey = "d1c5af3f-7119-494d-8987-cd72bc00bfd0"; // API key
    const houseWalletAddress = "6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF";

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                const userWallet = response.publicKey.toString();
                console.log("✅ Wallet connected:", userWallet);
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Please connect your wallet again.");
            }
        } else {
            alert("Phantom Wallet not found. Please install it and try again.");
        }
    }

    async function getHouseBalance() {
        try {
            const connection = new solanaWeb3.Connection(
                `https://rpc.helius.xyz/?api-key=${heliusApiKey}`,
                "confirmed"
            );
            const balance = await connection.getBalance(new solanaWeb3.PublicKey(houseWalletAddress));
            console.log(`🏠 House Wallet Balance: ${balance}`);
            return balance / solanaWeb3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error("❌ Error fetching house balance:", error);
            return 0;
        }
    }

    async function withdrawCoins() {
        alert("Withdraw function not yet implemented.");
    }

    connectWalletButton.addEventListener("click", connectWallet);
    withdrawButton.addEventListener("click", withdrawCoins);
    depositButton.addEventListener("click", () => alert("Deposit feature coming soon."));
});
