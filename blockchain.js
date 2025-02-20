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
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey;
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet.toString()}`;
                await initializeUserAccount();
                await updateBalance();
                updateRewardPool();
            } catch (error) {
                console.error("❌ Wallet connection failed:", error);
                alert("Please connect your wallet again.");
            }
        } else {
            alert("Phantom Wallet not found.");
        }
    }

    async function initializeUserAccount() {
        const userAccount = solanaWeb3.Keypair.generate();
        const tx = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.createAccount({
                fromPubkey: userWallet,
                newAccountPubkey: userAccount.publicKey,
                lamports: await connection.getMinimumBalanceForRentExemption(16),
                space: 16,
                programId,
            }),
            new solanaWeb3.TransactionInstruction({
                keys: [
                    { pubkey: userAccount.publicKey, isSigner: false, isWritable: true },
                    { pubkey: userWallet, isSigner: true, isWritable: false },
                    { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                ],
                programId,
                data: Buffer.from([0]), // Initialize
            })
        );
        const signature = await window.solana.signAndSendTransaction(tx);
        await connection.confirmTransaction(signature);
    }

    async function updateBalance() {
        if (userWallet) {
            const userAccountPDA = await solanaWeb3.PublicKey.findProgramAddress([Buffer.from("user", userWallet.toBuffer())], programId);
            const accountInfo = await connection.getAccountInfo(userAccountPDA[0]);
            if (accountInfo) {
                const balance = accountInfo.data.readBigUInt64LE(0) / BigInt(solanaWeb3.LAMPORTS_PER_SOL);
                document.getElementById("player-balance").innerText = `Your Balance: ${balance} Coins`;
            }
        }
    }

    async function depositCoins() {
        const amount = parseFloat(prompt("Enter coins to deposit (max 10,000):"));
        if (amount <= 0 || amount > 10000 || isNaN(amount)) {
            alert("❌ Invalid deposit amount!");
            return;
        }

        const userAccountPDA = await solanaWeb3.PublicKey.findProgramAddress([Buffer.from("user", userWallet.toBuffer())], programId);
        const gameStatePDA = await solanaWeb3.PublicKey.findProgramAddress([Buffer.from("game_state")], programId);

        const tx = new solanaWeb3.Transaction().add(
            new solanaWeb3.TransactionInstruction({
                keys: [
                    { pubkey: userAccountPDA[0], isSigner: false, isWritable: true },
                    { pubkey: gameStatePDA[0], isSigner: false, isWritable: true },
                    { pubkey: houseWalletAddress, isSigner: false, isWritable: true },
                    { pubkey: userWallet, isSigner: true, isWritable: true },
                    { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                ],
                programId,
                data: Buffer.from([1, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * solanaWeb3.LAMPORTS_PER_SOL))]).buffer)]), // Deposit
            })
        );
        const signature = await window.solana.signAndSendTransaction(tx);
        await connection.confirmTransaction(signature);
        alert(`✅ Deposited ${amount} coins!`);
        await updateBalance();
    }

    async function spinGameOnChain() {
        const userAccountPDA = await solanaWeb3.PublicKey.findProgramAddress([Buffer.from("user", userWallet.toBuffer())], programId);
        const gameStatePDA = await solanaWeb3.PublicKey.findProgramAddress([Buffer.from("game_state")], programId);

        const tx = new solanaWeb3.Transaction().add(
            new solanaWeb3.TransactionInstruction({
                keys: [
                    { pubkey: userAccountPDA[0], isSigner: false, isWritable: true },
                    { pubkey: gameStatePDA[0], isSigner: false, isWritable: true },
                    { pubkey: userWallet, isSigner: true, isWritable: false },
                ],
                programId,
                data: Buffer.from([2]), // Spin
            })
        );
        const signature = await window.solana.signAndSendTransaction(tx);
        await connection.confirmTransaction(signature);
        await updateBalance();
        spinGame(); // Frontend spin animasyonu
    }

    async function updateRewardPool() {
        const gameStatePDA = await solanaWeb3.PublicKey.findProgramAddress([Buffer.from("game_state")], programId);
        const accountInfo = await connection.getAccountInfo(gameStatePDA[0]);
        if (accountInfo) {
            const houseBalance = accountInfo.data.readBigUInt64LE(16) / BigInt(solanaWeb3.LAMPORTS_PER_SOL);
            const rewardPool = Number(houseBalance) / 10;
            document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: ${rewardPool.toLocaleString()} Coins`;
        }
    }

    connectWalletButton.addEventListener("click", connectWallet);
    depositButton.addEventListener("click", depositCoins);
    spinButton.addEventListener("click", spinGameOnChain);
    withdrawButton.addEventListener("click", () => alert("Withdraw disabled as per game rules."));
});
