document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const spinButton = document.getElementById("spin-button");
    const transferButton = document.getElementById("transfer-button");

    const programId = new window.solanaWeb3.PublicKey("8GeDy4btKEUvqyLAoqUzTHBfdAV3sn1dE7MDYPvjuhVn");
    const tokenMint = new window.solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump");
    let userWallet = null;
    let program = null;

    const connection = new window.solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");

    // Anchor ve IDL’yi yükle
    async function loadDependencies() {
        const anchorScript = document.createElement("script");
        anchorScript.src = "https://unpkg.com/@coral-xyz/anchor@0.29.0/dist/browser/index.js";
        document.head.appendChild(anchorScript);

        await new Promise((resolve) => {
            anchorScript.onload = resolve;
        });

        // IDL’yi yükle
        const response = await fetch("/crypto_jackpot.json");
        const IDL = await response.json();

        // Anchor provider ve program’ı başlat
        const provider = new window.anchor.AnchorProvider(connection, window.solana, { commitment: "confirmed" });
        window.anchor.setProvider(provider);
        program = new window.anchor.Program(IDL, programId, provider);
    }

    function createSetComputeUnitPriceInstruction(microLamports) {
        const buffer = new ArrayBuffer(9);
        const view = new DataView(buffer);
        view.setUint8(0, 1);
        let value = BigInt(microLamports);
        for (let i = 0; i < 8; i++) {
            view.setUint8(1 + i, Number(value & 0xffn));
            value = value >> 8n;
        }
        return new window.solanaWeb3.TransactionInstruction({
            programId: window.solanaWeb3.ComputeBudgetProgram.programId,
            keys: [],
            data: new Uint8Array(buffer),
        });
    }

    async function sendTransactionWithRetry(instructions, walletInterface, connection) {
        try {
            const tx = new window.solanaWeb3.Transaction();
            instructions.forEach((inst) => tx.add(inst));

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
            tx.recentBlockhash = blockhash;
            tx.feePayer = userWallet;

            const signedTx = await walletInterface.signTransaction(tx);
            const serializedTx = signedTx.serialize();

            const signature = await connection.sendRawTransaction(serializedTx, {
                skipPreflight: false,
                maxRetries: 5,
            });

            const confirmation = await connection.confirmTransaction(
                {
                    signature,
                    blockhash,
                    lastValidBlockHeight: lastValidBlockHeight + 300,
                },
                "confirmed"
            );

            if (confirmation.value.err) {
                throw new Error("Transaction failed: " + JSON.stringify(confirmation.value.err));
            }

            return signature;
        } catch (error) {
            console.error("Transaction error:", error.message, error.stack);
            throw error;
        }
    }

    async function ensureTokenAccountExists(userWallet, tokenMint, connection) {
        const userTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, userWallet);
        const accountInfo = await connection.getAccountInfo(userTokenAccount);

        if (!accountInfo) {
            const instructions = [
                window.splToken.createAssociatedTokenAccountInstruction(
                    userWallet,
                    userTokenAccount,
                    userWallet,
                    tokenMint
                ),
            ];
            await sendTransactionWithRetry(instructions, window.solana, connection);
        }

        return userTokenAccount;
    }

    async function connectWallet() {
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet not found. Please install Phantom extension.");
            return;
        }
        try {
            await loadDependencies();
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
            const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user_account"), userWallet.toBuffer()],
                programId
            );
            const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );

            let accountInfo = await connection.getAccountInfo(userAccountPDA);
            if (accountInfo) {
                console.log("✅ User account already initialized:", userAccountPDA.toBase58());
                return;
            }

            const instructions = [];
            instructions.push(createSetComputeUnitPriceInstruction(2000000));

            const tx = await program.methods
                .initialize()
                .accounts({
                    userAccount: userAccountPDA,
                    gameState: gameStatePDA,
                    user: userWallet,
                    systemProgram: window.solanaWeb3.SystemProgram.programId,
                })
                .instruction();

            instructions.push(tx);

            const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
            console.log("✅ User account initialized:", signature);
        } catch (error) {
            console.error("❌ Initialization failed:", error.message, error.stack);
            alert("Failed to initialize account: " + error.message);
            throw error;
        }
    }

    async function updateBalance() {
        if (!userWallet) return;
        try {
            const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user_account"), userWallet.toBuffer()],
                programId
            );
            const accountInfo = await connection.getAccountInfo(userAccountPDA);
            if (accountInfo) {
                const balance = Number(accountInfo.data.readBigUInt64LE(8)) / 1_000_000;
                const earnedBalance = Number(accountInfo.data.readBigUInt64LE(16)) / 1_000_000;
                document.getElementById("player-balance").innerText = `Your Balance: ${balance.toLocaleString()} 2JZ Coins`;
                document.getElementById("earned-coins").innerText = `Earned Coins: ${earnedBalance.toLocaleString()} 2JZ Coins`;
            } else {
                document.getElementById("player-balance").innerText = `Your Balance: 0 2JZ Coins`;
                document.getElementById("earned-coins").innerText = `Earned Coins: 0 2JZ Coins`;
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
        const amount = parseFloat(prompt("Enter 2JZ Coins to deposit (max 10,000):"));
        if (amount <= 0 || amount > 10000 || isNaN(amount)) {
            alert("❌ Invalid deposit amount! Max 10,000 coins.");
            return;
        }
        try {
            const userTokenAccount = await ensureTokenAccountExists(userWallet, tokenMint, connection);

            const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user_account"), userWallet.toBuffer()],
                programId
            );
            const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );
            const [gameVaultPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_vault")],
                programId
            );

            const instructions = [];
            instructions.push(createSetComputeUnitPriceInstruction(2000000));

            const tx = await program.methods
                .deposit(new window.anchor.BN(Math.floor(amount * 1_000_000)))
                .accounts({
                    userAccount: userAccountPDA,
                    gameState: gameStatePDA,
                    userTokenAccount: userTokenAccount,
                    gameVault: gameVaultPDA,
                    user: userWallet,
                    tokenProgram: window.splToken.TOKEN_PROGRAM_ID,
                })
                .instruction();

            instructions.push(tx);

            const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
            alert(`✅ Deposited ${amount} 2JZ Coins!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Deposit failed:", error.message, error.stack);
            alert(`Deposit failed: ${error.message}`);
        }
    }

    async function withdrawCoins() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        const amount = parseFloat(prompt("Enter earned 2JZ Coins to withdraw:"));
        if (amount <= 0 || isNaN(amount)) {
            alert("❌ Invalid withdraw amount!");
            return;
        }
        try {
            const userTokenAccount = await ensureTokenAccountExists(userWallet, tokenMint, connection);

            const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user_account"), userWallet.toBuffer()],
                programId
            );
            const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );
            const [gameVaultPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_vault")],
                programId
            );

            const instructions = [];
            instructions.push(createSetComputeUnitPriceInstruction(2000000));

            const tx = await program.methods
                .withdraw(new window.anchor.BN(Math.floor(amount * 1_000_000)))
                .accounts({
                    userAccount: userAccountPDA,
                    gameState: gameStatePDA,
                    userTokenAccount: userTokenAccount,
                    gameVault: gameVaultPDA,
                    user: userWallet,
                    tokenProgram: window.splToken.TOKEN_PROGRAM_ID,
                })
                .instruction();

            instructions.push(tx);

            const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
            alert(`✅ Withdrawn ${amount} earned 2JZ Coins!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Withdraw failed:", error.message, error.stack);
            alert(`Withdraw failed: ${error.message}`);
        }
    }

    async function spinGameOnChain() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user_account"), userWallet.toBuffer()],
                programId
            );
            const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );

            const instructions = [];
            instructions.push(createSetComputeUnitPriceInstruction(2000000));

            const tx = await program.methods
                .spin()
                .accounts({
                    userAccount: userAccountPDA,
                    gameState: gameStatePDA,
                    user: userWallet,
                })
                .instruction();

            instructions.push(tx);

            const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
            const accountInfo = await connection.getAccountInfo(userAccountPDA);
            const previousEarned = Number(accountInfo.data.readBigUInt64LE(16)) / 1_000_000;

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const updatedAccountInfo = await connection.getAccountInfo(userAccountPDA);
            const winnings = (Number(updatedAccountInfo.data.readBigUInt64LE(16)) / 1_000_000) - previousEarned;

            await updateBalance();
            spinGame(winnings);
            window.dispatchEvent(new Event("spinComplete"));
        } catch (error) {
            console.error("❌ Spin failed:", error.message, error.stack);
            alert("Spin failed: " + error.message);
        }
    }

    async function transferCoins() {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }
        const amount = parseFloat(prompt("Enter earned 2JZ Coins to transfer to game balance:"));
        if (amount <= 0 || isNaN(amount)) {
            alert("❌ Invalid transfer amount!");
            return;
        }
        try {
            const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("user_account"), userWallet.toBuffer()],
                programId
            );

            const instructions = [];
            instructions.push(createSetComputeUnitPriceInstruction(2000000));

            const tx = await program.methods
                .transfer(new window.anchor.BN(Math.floor(amount * 1_000_000)))
                .accounts({
                    userAccount: userAccountPDA,
                    user: userWallet,
                })
                .instruction();

            instructions.push(tx);

            const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
            alert(`✅ Transferred ${amount} earned coins to game balance!`);
            await updateBalance();
        } catch (error) {
            console.error("❌ Transfer failed:", error.message, error.stack);
            alert(`Transfer failed: ${error.message}`);
        }
    }

    async function updateRewardPool() {
        try {
            const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from("game_state")],
                programId
            );
            const accountInfo = await connection.getAccountInfo(gameStatePDA);
            if (accountInfo && accountInfo.data) {
                const vaultBalance = Number(accountInfo.data.readBigUInt64LE(16)) / 1_000_000;
                const rewardPool = vaultBalance / 10;
                document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: ${rewardPool.toLocaleString()} 2JZ Coins`;

                document.getElementById("first-spin-count").innerText = `${(rewardPool * 0.5).toLocaleString()} coins`;
                document.getElementById("second-spin-count").innerText = `${(rewardPool * 0.3).toLocaleString()} coins`;
                document.getElementById("third-spin-count").innerText = `${(rewardPool * 0.2).toLocaleString()} coins`;
            } else {
                document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 2JZ Coins`;
            }
        } catch (error) {
            console.error("❌ Reward pool update failed:", error.message, error.stack);
            document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: Error`;
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    spinButton.addEventListener("click", spinGameOnChain);
    transferButton.addEventListener("click", transferCoins);
});