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
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const [userAccountPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                    [Buffer.from("user"), userWallet.toBytes()],
                    programId
                );
                const [gameStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
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

                // Blockhash’i her denemede taze al
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
                return; // Başarılıysa döngüden çık
            } catch (error) {
                attempts++;
                console.error(`❌ Initialization attempt ${attempts} failed:`, error.message, error.stack);
                if (attempts === maxAttempts) {
                    alert("Failed to initialize account after multiple attempts: " + error.message);
                    throw error; // Maksimum deneme sonrası vazgeç
                }
                if (error.message.includes("block height exceeded")) {
                    console.log("Block height exceeded, retrying...");
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
                } else {
                    throw error; // Diğer hatalarda hemen vazgeç
                }
            }
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

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
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
                return;
            } catch (error) {
                attempts++;
                console.error(`❌ Deposit attempt ${attempts} failed:`, error.message, error.stack);
                if (attempts === maxAttempts) {
                    alert(`Deposit failed after ${maxAttempts} attempts: ${error.message}`);
                    throw error;
                }
                if (error.message.includes("block height exceeded")) {
                    console.log("Block height exceeded, retrying...");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw error;
                }
            }
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

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
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

                const tx = new solanaWeb3.Transaction().add(
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
                return;
            } catch (error) {
                attempts++;
                console.error(`❌ Withdraw attempt ${attempts} failed:`, error.message, error.stack);
                if (attempts === maxAttempts) {
                    alert(`Withdraw failed after ${maxAttempts} attempts: ${error.message}`);
                    throw error;
                }
                if (error.message.includes("block height exceeded")) {
                    console.log("Block height exceeded, retrying...");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw error;
                }
            }
        }
    }

    async function spinGameOnChain() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const [userAccountPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                    [Buffer.from("user"), userWallet.toBytes()],
                    programId
                );
                const [gameStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
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
                return;
            } catch (error) {
                attempts++;
                console.error(`❌ Spin attempt ${attempts} failed:`, error.message, error.stack);
                if (attempts === maxAttempts) {
                    alert(`Spin failed after ${maxAttempts} attempts: ${error.message}`);
                    throw error;
                }
                if (error.message.includes("block height exceeded")) {
                    console.log("Block height exceeded, retrying...");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw error;
                }
            }
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
