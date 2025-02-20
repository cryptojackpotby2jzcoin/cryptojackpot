// Buffer polyfill zaten index.html'de eklendi, burada manuel tanımlamaya gerek yok

document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const spinButton = document.getElementById("spin-button");

    const heliusApiKey = "d1c5af3f-7119-494d-8987-cd72bc00bfd0";
    const programId = new solanaWeb3.PublicKey("EaQ7bsbPp8ffC1j96RjWkuiWr5YnpfcuPJo6ZNJaggXH");
    const houseWalletAddress = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");
    let userWallet = null;

    const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");

    async function connectWallet() {
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet not found. Please install it.");
            return;
        }
        try {
            const response = await window.solana.connect();
            userWallet = response.publicKey;
            document.getElementById("wallet-address").innerText = `Wallet: ${userWallet.toString()}`;
            await initializeUserAccount();
            await updateBalance();
            await updateRewardPool();
        } catch (error) {
            console.error("❌ Wallet connection failed:", error);
            alert("Wallet connection failed. Please try again.");
        }
    }

    async function initializeUserAccount() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const [userAccountPDA, bump] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const [gameStatePDA, __] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );

            const tx = new solanaWeb3.Transaction().add(
                new solanaWeb3.TransactionInstruction({
                    keys: [
                        { pubkey: userAccountPDA, isSigner: false, isWritable: true },
                        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
                        { pubkey: userWallet, isSigner: true, isWritable: true },
                        { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                    ],
                    programId,
                    data: Buffer.from([0]), // Initialize
                })
            );
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;
            const signature = await window.solana.signAndSendTransaction(tx);
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });
            console.log("✅ User account initialized");
        } catch (error) {
            console.error("❌ Initialization failed:", error);
            alert("Failed to initialize account. Please try again.");
        }
    }

    async function updateBalance() {
        if (!userWallet) return;
        try {
            const [userAccountPDA, _] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const accountInfo = await connection.getAccountInfo(userAccountPDA);
            if (accountInfo) {
                const balance = Number(accountInfo.data.readBigUInt64LE(8)) / solanaWeb3.LAMPORTS_PER_SOL;
                document.getElementById("player-balance").innerText = `Your Balance: ${balance} Coins`;
            } else {
                document.getElementById("player-balance").innerText = `Your Balance: 0 Coins (Account not initialized)`;
            }
        } catch (error) {
            console.error("❌ Balance update failed:", error);
            alert("Failed to update balance. Please try again.");
        }
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        const amount = parseFloat(prompt("Enter coins to deposit (max 10,000):"));
        if (amount <= 0 || amount > 10000 || isNaN(amount)) {
            alert("❌ Invalid deposit amount!");
            return;
        }

        try {
            const [userAccountPDA, _] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const [gameStatePDA, __] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );

            const tx = new solanaWeb3.Transaction().add(
                new solanaWeb3.TransactionInstruction({
                    keys: [
                        { pubkey: userAccountPDA, isSigner: false, isWritable: true },
                        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
                        { pubkey: houseWalletAddress, isSigner: false, isWritable: true },
                        { pubkey: userWallet, isSigner: true, isWritable: true },
                        { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                    ],
                    programId,
                    data: Buffer.from([1, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * solanaWeb3.LAMPORTS_PER_SOL))]).buffer)]), // Deposit
                })
            );
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;
            const signature = await window.solana.signAndSendTransaction(tx);
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });
            alert(`✅ Deposited ${amount} coins!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Deposit failed:", error);
            alert("Deposit failed. Please check your wallet and try again.");
        }
    }

    async function spinGameOnChain() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const [userAccountPDA, _] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const [gameStatePDA, __] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );

            const tx = new solanaWeb3.Transaction().add(
                new solanaWeb3.TransactionInstruction({
                    keys: [
                        { pubkey: userAccountPDA, isSigner: false, isWritable: true },
                        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
                        { pubkey: userWallet, isSigner: true, isWritable: false },
                    ],
                    programId,
                    data: Buffer.from([2]), // Spin
                })
            );
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;
            const signature = await window.solana.signAndSendTransaction(tx);
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });
            await updateBalance();
            spinGame(); // Frontend spin animasyonu
            window.dispatchEvent(new Event("spinComplete")); // Spin sayaçlarını güncelle
        } catch (error) {
            console.error("❌ Spin failed:", error);
            alert("Spin failed. Please check your balance and try again.");
        }
    }

    async function updateRewardPool() {
        try {
            const [gameStatePDA, _] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );
            const accountInfo = await connection.getAccountInfo(gameStatePDA);
            if (accountInfo) {
                const houseBalance = Number(accountInfo.data.readBigUInt64LE(16)) / solanaWeb3.LAMPORTS_PER_SOL;
                const rewardPool = houseBalance / 10;
                document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: ${rewardPool.toLocaleString()} Coins`;
            } else {
                document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 Coins`;
            }
        } catch (error) {
            console.error("❌ Reward pool update failed:", error);
            alert("Failed to update reward pool. Please try again.");
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    spinButton.addEventListener("click", spinGameOnChain);
    withdrawButton.addEventListener("click", () => alert("Withdraw disabled as per game rules."));
});
