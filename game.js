window.onload = async function () {
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    
    let userWallet = null;
    let playerBalance = 0;
    const coinPrice = 0.000005775;
    const programId = new solanaWeb3.PublicKey("7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv");

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey.toString();
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
        if (!userWallet) return;
        try {
            const connection = new solanaWeb3.Connection("https://api.testnet.solana.com", "confirmed");
            const accountInfo = await connection.getParsedTokenAccountsByOwner(new solanaWeb3.PublicKey(userWallet), {
                mint: new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump")
            });

            if (accountInfo.value.length > 0) {
                playerBalance = accountInfo.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            } else {
                playerBalance = 0;
            }
            updateBalances();
        } catch (error) {
            console.error("❌ Bakiye alınırken hata oluştu:", error);
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
            const connection = new solanaWeb3.Connection("https://api.testnet.solana.com", "confirmed");
            const transaction = new solanaWeb3.Transaction().add(
                new solanaWeb3.TransactionInstruction({
                    keys: [{ pubkey: new solanaWeb3.PublicKey(userWallet), isSigner: true, isWritable: true }],
                    programId: programId,
                    data: Buffer.from(Uint8Array.of(1)), // Smart contract'taki "spin" işlemi
                })
            );

            const signature = await window.solana.signAndSendTransaction(transaction);
            console.log("✅ Spin işlemi tamamlandı:", signature);
            resultMessage.textContent = "🎰 Spin başarıyla gerçekleşti!";
            await getBalance();
        } catch (error) {
            console.error("❌ Spin işlemi başarısız oldu:", error);
            alert("Spin sırasında hata oluştu.");
        }
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
    }

    spinButton.addEventListener("click", spin);
    await connectWallet();
};
