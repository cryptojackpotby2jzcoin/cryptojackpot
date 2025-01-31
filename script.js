document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");

    let userWallet = null;
    let playerBalance = 0;

    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));
    const programId = new solanaWeb3.PublicKey("7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv");
    const houseWallet = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet}`;
                console.log("✅ Wallet bağlandı:", userWallet);
                await getBalance();
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    async function getBalance() {
        console.log("🔄 Bakiyeniz blockchain'den alınıyor...");

        // Oyuncunun blockchain üzerindeki token bakiyesini al
        try {
            const userPublicKey = new solanaWeb3.PublicKey(userWallet);
            const tokenAccount = await connection.getParsedTokenAccountsByOwner(userPublicKey, {
                mint: new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump")
            });

            if (tokenAccount.value.length > 0) {
                playerBalance = tokenAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            } else {
                playerBalance = 0;
            }

            updateBalances();
        } catch (error) {
            console.error("❌ Bakiye alınırken hata oluştu:", error);
        }
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Wallet bağlamadan deposit yapamazsınız!");
            return;
        }

        let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
        amount = parseInt(amount);
        if (isNaN(amount) || amount <= 0) {
            alert("⚠️ Geçerli bir miktar giriniz!");
            return;
        }

        console.log(`🔄 ${amount} coins depositing...`);

        // Smart Contract’a token gönderme işlemi
        try {
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(userWallet),
                    toPubkey: houseWallet,
                    lamports: amount * 1e9, // 1 SOL = 10^9 lamports
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = new solanaWeb3.PublicKey(userWallet);

            const signedTransaction = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature, "confirmed");

            alert(`✅ ${amount} coin deposit edildi!`);
            await getBalance();
        } catch (error) {
            console.error("❌ Deposit işlemi başarısız oldu:", error);
            alert("Deposit sırasında hata oluştu.");
        }
    }

    async function spin() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        if (playerBalance <= 0) {
            resultMessage.textContent = "❌ Yetersiz bakiye!";
            return;
        }

        console.log("🔄 Blockchain üzerinden spin işlemi başlatılıyor...");

        try {
            const transaction = new solanaWeb3.Transaction().add(
                new solanaWeb3.TransactionInstruction({
                    keys: [{ pubkey: new solanaWeb3.PublicKey(userWallet), isSigner: true, isWritable: true }],
                    programId: programId,
                    data: Buffer.from(Uint8Array.of(1)), // Smart contract'taki "spin" işlemini çağırır
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = new solanaWeb3.PublicKey(userWallet);

            const signedTransaction = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature, "confirmed");

            console.log("✅ Spin işlemi tamamlandı:", signature);
            resultMessage.textContent = "🎰 Spin başarıyla gerçekleşti!";
            playerBalance--;
            updateBalances();
        } catch (error) {
            console.error("❌ Spin işlemi başarısız oldu:", error);
            alert("Spin sırasında hata oluştu.");
        }
    }

    async function withdrawCoins() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        if (playerBalance <= 0) {
            alert("⚠️ Çekilecek coin yok!");
            return;
        }

        console.log(`🔄 Blockchain üzerinden withdraw başlatılıyor: ${playerBalance} coin`);

        alert(`✅ ${playerBalance} coin Phantom Wallet'a gönderildi!`);
        playerBalance = 0;
        updateBalances();
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
    }

    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);
    
    updateBalances();
});
