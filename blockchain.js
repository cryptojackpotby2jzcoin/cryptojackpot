// Import Buffer directly with a script tag
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/buffer/5.7.1/buffer.min.js";
script.onload = () => {
    window.Buffer = Buffer;
};
document.head.appendChild(script);

// ✅ Solana connection (Mainnet RPC)
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

// ✅ 2JZ Coin mint address
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");

// ✅ Query user's 2JZ Coin balance
async function getUserBalance() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("❌ Wallet is not connected!");
        return;
    }

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
            window.solana.publicKey,
            { mint: tokenMintAddress }
        );

        let balance = 0;

        if (accounts.value.length > 0) {
            balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        }

        console.log(`🔄 User's 2JZ Coin Balance: ${balance}`);
        return balance;

    } catch (error) {
        console.error("❌ Error fetching balance:", error);
        return 0;
    }
}

// Make the function global
window.getUserBalance = getUserBalance;

// ✅ Deposit Function - Add coins to game balance
async function depositCoins(amount) {
    const currentBalance = await getUserBalance();
    if (currentBalance < amount) {
        alert("❌ Insufficient balance! Please add more coins to your wallet.");
        return 0;
    }

    // Increase game balance
    window.gameBalance = (window.gameBalance || 0) + amount;
    console.log(`💰 ${amount} 2JZ Coins added to game balance. Total: ${window.gameBalance}`);
    return window.gameBalance;
}

// Make the function global
window.depositCoins = depositCoins;

// ✅ Spin Function - Deduct coins from game balance
async function spinGame() {
    if (!window.gameBalance || window.gameBalance <= 0) {
        alert("❌ Insufficient game balance. Please deposit coins!");
        return;
    }

    window.gameBalance--;
    console.log(`🎰 Spin initiated! Remaining game balance: ${window.gameBalance}`);

    // Win probability and reward calculation
    const winChance = Math.random();
    if (winChance > 0.7) {
        const reward = 5;  // Win reward
        window.gameBalance += reward;
        console.log(`🎉 Congratulations! You won ${reward} 2JZ Coins! New balance: ${window.gameBalance}`);
        alert(`🎉 Congratulations! You won ${reward} 2JZ Coins!`);
    } else {
        console.log("😢 Unfortunately, you didn't win this time.");
        alert("😢 Unfortunately, you didn't win this time.");
    }
}

// Make the function global
window.spinGame = spinGame;
