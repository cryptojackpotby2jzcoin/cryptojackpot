document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const spinButton = document.getElementById("spin-button");

    const programId = new solanaWeb3.PublicKey("EaQ7bsbPp8ffC1j96RjWkuiWr5YnpfcuPJo6ZNJaggXH");
    const houseWalletAddress = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");
    const tokenMint = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"); // 2JZ Coin mint adresi
    let userWallet = null;

    // QuickNode Solana Mainnet Endpoint (API anahtarıyla)
    const connection = new solanaWeb3.Connection(
        "https://indulgent-empty-crater.solana-mainnet.quiknode.pro/34892d10273f2bbafc5c4d29e7114a530226dd29/QN_a412f1b56b2641028b059eabc49832fc",
        "confirmed"
    );

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
            alert("Wallet connection failed: " + error.message);
        }
    }

    async function initializeUserAccount() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const [userAccountPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const [gameStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );

            // Hesap kontrolü, hata alırsa devam et
            let accountInfo;
            try {
                accountInfo = await connection.getAccountInfo(userAccountPDA);
            } catch (e) {
                console.warn("Failed to check account info, proceeding anyway:", e.message);
            }
            if (accountInfo) {
                console.log("✅ User account already initialized:", userAccountPDA.toString());
                return;
            }

            const tx = new solanaWeb3.Transaction();

            // Priority fee ekle (number olarak, 5000 microLamports = 0.000005 SOL)
            tx.add(
                solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 5000 // Number olarak, 5000 microLamports
                })
            );

            tx.add(
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

            console.log("Please approve the transaction in Phantom within 30 seconds to initialize your account...");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;

            const signedTx = await window.solana.signAndSendTransaction(tx);
            const signature = typeof signedTx === 'object' && signedTx.signature ? signedTx.signature : signedTx;
            console.log("Transaction signature:", signature);

            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });

            if (confirmation.value.err) {
                throw new Error("Initialization transaction failed: " + JSON.stringify(confirmation.value.err));
            }
            console.log("✅ User account initialized:", signature);
        } catch (error) {
            console.error("❌ Initialization failed:", error.message, error.stack);
            if (error.message.includes("block height exceeded")) {
                alert("Transaction expired! Please try again and approve within 30 seconds in Phantom.");
            } else if (error.message.includes("User rejected")) {
                alert("You rejected the transaction. Please approve it to initialize your account.");
            } else if (error.message.includes("UNAUTHORIZED")) {
                alert("RPC access denied. Please check your QuickNode API key or contact QuickNode support.");
            } else {
                alert("Failed to initialize account: " + error.message + " (Check @solana/web3.js version 1.78.0 or microLamports format)");
            }
            throw error;
        }
    }

    async function updateBalance() {
        if (!userWallet) return;
        try {
            const [userAccountPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const accountInfo = await connection.getAccountInfo(userAccountPDA);
            if (accountInfo) {
                const balance = Number(accountInfo.data.readBigUInt64LE(8)) / 1_000_000; // 6 decimals
                document.getElementById("player-balance").innerText = `Your Balance: ${balance.toLocaleString()} 2JZ Coins ($0.0000)`;
                document.getElementById("earned-coins").innerText = `Earned Coins: ${balance.toLocaleString()} 2JZ Coins ($0.0000)`;
            } else {
                document.getElementById("player-balance").innerText = `Your Balance: 0 2JZ Coins ($0.0000)`;
                document.getElementById("earned-coins").innerText = `Earned Coins: 0 2JZ Coins ($0.0000)`;
            }
        } catch (error) {
            console.error("❌ Balance update failed:", error.message, error.stack);
            document.getElementById("player-balance").innerText = `Your Balance: Error`;
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
            const [userAccountPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const [gameStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
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

            const tx = new solanaWeb3.Transaction();

            // Priority fee ekle
            tx.add(
                solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 5000 // Number olarak, 5000 microLamports
                })
            );

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

            tx.add(
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
                    data: Buffer.from([1, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * 1_000_000))]).buffer)]), // Deposit
                })
            );

            console.log("Please approve the deposit transaction in Phantom within 30 seconds...");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;

            const signedTx = await window.solana.signAndSendTransaction(tx);
            const signature = typeof signedTx === 'object' && signedTx.signature ? signedTx.signature : signedTx;
            console.log("Deposit transaction signature:", signature);

            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });

            if (confirmation.value.err) {
                throw new Error("Deposit transaction failed: " + JSON.stringify(confirmation.value.err));
            }

            console.log("✅ Deposit successful:", signature);
            alert(`✅ Deposited ${amount} 2JZ Coins!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Deposit failed:", error.message, error.stack);
            if (error.message.includes("block height exceeded")) {
                alert("Transaction expired! Please try again and approve within 30 seconds in Phantom.");
            } else if (error.message.includes("User rejected")) {
                alert("You rejected the deposit transaction. Please approve it to continue.");
            } else if (error.message.includes("UNAUTHORIZED")) {
                alert("RPC access denied. Please check your QuickNode API key or contact QuickNode support.");
            } else {
                alert(`Deposit failed: ${error.message}. Check your 2JZ Coin balance and SOL for fees. (Check @solana/web3.js version 1.78.0 or microLamports format)`);
            }
            throw error;
        }
    }

    async function withdrawCoins() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        const amount = parseFloat(prompt("Enter 2JZ Coins to withdraw:"));
        if (amount <= 0 || isNaN(amount)) {
            alert("❌ Invalid withdraw amount!");
            return;
        }

        try {
            const [userAccountPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const [gameStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
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

            const tx = new solanaWeb3.Transaction();

            // Priority fee ekle
            tx.add(
                solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 5000 // Number olarak, 5000 microLamports
                })
            );

            tx.add(
                new solanaWeb3.TransactionInstruction({
                    keys: [
                        { pubkey: userAccountPDA, isSigner: false, isWritable: true },
                        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
                        { pubkey: houseTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: userWallet, isSigner: true, isWritable: false },
                        { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                    ],
                    programId,
                    data: Buffer.from([3, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * 1_000_000))]).buffer)]), // Withdraw
                })
            );

            console.log("Please approve the withdraw transaction in Phantom within 30 seconds...");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;

            const signedTx = await window.solana.signAndSendTransaction(tx);
            const signature = typeof signedTx === 'object' && signedTx.signature ? signedTx.signature : signedTx;
            console.log("Withdraw transaction signature:", signature);

            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });

            if (confirmation.value.err) {
                throw new Error("Withdraw transaction failed: " + JSON.stringify(confirmation.value.err));
            }

            console.log("✅ Withdraw successful:", signature);
            alert(`✅ Withdrawn ${amount} 2JZ Coins!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Withdraw failed:", error.message, error.stack);
            if (error.message.includes("block height exceeded")) {
                alert("Transaction expired! Please try again and approve within 30 seconds in Phantom.");
            } else if (error.message.includes("User rejected")) {
                alert("You rejected the withdraw transaction. Please approve it to continue.");
            } else if (error.message.includes("UNAUTHORIZED")) {
                alert("RPC access denied. Please check your QuickNode API key or contact QuickNode support.");
            } else {
                alert(`Withdraw failed: ${error.message}. Check your balance and SOL for fees. (Check @solana/web3.js version 1.78.0 or microLamports format)`);
            }
            throw error;
        }
    }

    async function spinGameOnChain() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const [userAccountPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user"), userWallet.toBytes()],
                programId
            );
            const [gameStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );

            const tx = new solanaWeb3.Transaction();

            // Priority fee ekle
            tx.add(
                solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 5000 // Number olarak, 5000 microLamports
                })
            );

            tx.add(
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

            console.log("Please approve the spin transaction in Phantom within 30 seconds...");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;

            const signedTx = await window.solana.signAndSendTransaction(tx);
            const signature = typeof signedTx === 'object' && signedTx.signature ? signedTx.signature : signedTx;
            console.log("Spin transaction signature:", signature);

            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });

            if (confirmation.value.err) {
                throw new Error("Spin transaction failed: " + JSON.stringify(confirmation.value.err));
            }

            console.log("✅ Spin successful:", signature);
            await updateBalance();
            spinGame(); // Frontend spin animasyonu
            window.dispatchEvent(new Event("spinComplete"));
        } catch (error) {
            console.error("❌ Spin failed:", error.message, error.stack);
            if (error.message.includes("block height exceeded")) {
                alert("Transaction expired! Please try again and approve within 30 seconds in Phantom.");
            } else if (error.message.includes("User rejected")) {
                alert("You rejected the spin transaction. Please approve it to continue.");
            } else if (error.message.includes("UNAUTHORIZED")) {
                alert("RPC access denied. Please check your QuickNode API key or contact QuickNode support.");
            } else {
                alert("Spin failed: " + error.message + " (Check @solana/web3.js version 1.78.0 or microLamports format)");
            }
            throw error;
        }
    }

    async function updateRewardPool() {
        try {
            const [gameStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );
            const accountInfo = await connection.getAccountInfo(gameStatePDA);
            if (accountInfo && accountInfo.data) {
                const houseBalance = Number(accountInfo.data.readBigUInt64LE(16)) / 1_000_000; // 6 decimals
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
            document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: Error`;
        }
    }

    // Event Listeners
    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    spinButton.addEventListener("click", spinGameOnChain);
});
