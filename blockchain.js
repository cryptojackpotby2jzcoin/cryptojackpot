document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const spinButton = document.getElementById("spin-button");

    const heliusApiKey = "d1c5af3f-7119-494d-8987-cd72bc00bfd0";
    const programId = new solanaWeb3.PublicKey("EaQ7bsbPp8ffC1j96RjWkuiWr5YnpfcuPJo6ZNJaggXH");
    const houseWalletAddress = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");
    const tokenMint = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"); // 2JZ Coin mint adresi
    let userWallet = null;

    // Buffer polyfill kontrolü
    if (typeof Buffer === 'undefined') {
        window.Buffer = require('buffer/').Buffer;
    }

    const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");

    async function connectWallet() {
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet not found. Please install Phantom extension.");
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
            console.error("❌ Wallet connection failed:", error.message, error.stack);
            alert("Wallet connection failed. Please try again or install Phantom.");
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
                const balance = Number(accountInfo.data.readBigUInt64LE(8)); // 2JZ Coin balance (decimal)
                document.getElementById("player-balance").innerText = `Your Balance: ${balance} 2JZ Coins ($0.0000)`;
            } else {
                document.getElementById("player-balance").innerText = `Your Balance: 0 2JZ Coins ($0.0000)`;
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
        const amount = parseFloat(prompt("Enter 2JZ Coins to deposit (max 10,000,000):"));
        if (amount <= 0 || amount > 10000000 || isNaN(amount)) {
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

            // 2JZ Coin ile token transferi
            const userTokenAccount = await getAssociatedTokenAddress(
                tokenMint,
                userWallet,
                false
            );
            const houseTokenAccount = await getAssociatedTokenAddress(
                tokenMint,
                houseWalletAddress,
                false
            );

            const tx = new solanaWeb3.Transaction();
            tx.add(
                new solanaWeb3.TransactionInstruction({
                    keys: [
                        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: houseTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: userWallet, isSigner: true, isWritable: false },
                        { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                    ],
                    programId,
                    data: Buffer.from([1, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount))]).buffer)]), // Deposit
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
            alert(`✅ Deposited ${amount} 2JZ Coins!`);
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
            const [gameStatePDA, bump] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );
            const accountInfo = await connection.getAccountInfo(gameStatePDA);
            if (accountInfo && accountInfo.data) {
                const houseBalance = Number(accountInfo.data.readBigUInt64LE(16)); // 2JZ Coin balance (decimal)
                if (houseBalance > 0) {
                    const rewardPool = houseBalance / 10;
                    document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: ${rewardPool.toFixed(2)} 2JZ Coins`;
                } else {
                    document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 2JZ Coins`;
                }
            } else {
                document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 2JZ Coins (Account not initialized)`;
            }
        } catch (error) {
            console.error("❌ Reward pool update failed:", error.message, error.stack);
            document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: Error (Retry)`;
            alert("Failed to update reward pool. This may be due to network issues. Please try refreshing the page.");
        }
    }

    // Yardımcı fonksiyon: Associated Token Account adresini al
    async function getAssociatedTokenAddress(mint, owner, allowOwnerOffCurve = false) {
        return await splToken.getAssociatedTokenAddress(
            mint,
            owner,
            allowOwnerOffCurve,
            splToken.TOKEN_PROGRAM_ID,
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        );
    }

    // Event Listeners
    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    spinButton.addEventListener("click", spinGameOnChain);
    // Withdraw butonu zaten etkisiz, event listener eklenmedi
});
