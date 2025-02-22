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
                const balance = Number(accountInfo.data.readBigUInt64LE(8)) / 1_000_000; // 2JZ Coin balance (6 decimal assumed)
                document.getElementById("player-balance").innerText = `Your Balance: ${balance.toLocaleString()} 2JZ Coins ($0.0000)`;
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

            const userTokenAccount = await splToken.getAssociatedTokenAddress(
                tokenMint,
                userWallet
            );
            const houseTokenAccount = await splToken.getAssociatedTokenAddress(
                tokenMint,
                houseWalletAddress
            );

            // ATA yoksa oluştur
            const userTokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
            if (!userTokenAccountInfo) {
                tx.add(
                    splToken.createAssociatedTokenAccountInstruction(
                        userWallet,
                        userTokenAccount,
                        userWallet,
                        tokenMint
                    )
                );
            }

            const houseTokenAccountInfo = await connection.getAccountInfo(houseTokenAccount);
            if (!houseTokenAccountInfo) {
                tx.add(
                    splToken.createAssociatedTokenAccountInstruction(
                        userWallet,
                        houseTokenAccount,
                        houseWalletAddress,
                        tokenMint
                    )
                );
            }

            const tx = new solanaWeb3.Transaction().add(
                new solanaWeb3.TransactionInstruction({
                    keys: [
                        { pubkey: userAccountPDA, isSigner: false, isWritable: true },
                        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
                        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: houseTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: userWallet, isSigner: true, isWritable: false },
                        { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                    ],
                    programId,
                    data: Buffer.from([1, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * 1_000_000))]).buffer)]), // Deposit (6 decimals)
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
                const houseBalance = Number(accountInfo.data.readBigUInt64LE(16)) / 1_000_000; // 2JZ Coin balance (6 decimals)
                if (houseBalance > 0) {
                    const rewardPool = houseBalance / 10;
                    document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: ${rewardPool.toLocaleString()} 2JZ Coins ($74.99)`;
                } else {
                    document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 2JZ Coins ($0.00)`;
                }
            } else {
                document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 2JZ Coins ($0.00) (Account not initialized)`;
            }
        } catch (error) {
            console.error("❌ Reward pool update failed:", error.message, error.stack);
            alert("Failed to update reward pool. Please try refreshing the page.");
        }
    }

    // Event Listeners
    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    spinButton.addEventListener("click", spinGameOnChain);
});
