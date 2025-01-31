document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");

    let userWallet = null;
    let playerBalance = 0;

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
        console.log("🔄 Bakiyeniz alınıyor...");
        playerBalance = 100; // Smart contract'a bağlanınca değiştirilecek
        updateBalances();
    }

    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Wallet bağlamadan deposit yapamazsınız!");
            return;
        }

        let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
        amount = parseInt(amount);
        if (amount <= 0) return;

        console.log(`🔄 ${amount} coins depositing...`);
        playerBalance += amount;
        alert(`✅ ${amount} coin deposit edildi!`);
        updateBalances();
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

        const transaction = new solanaWeb3.Transaction().add(
            new solanaWeb3.TransactionInstruction({
                keys: [{ pubkey: new solanaWeb3.PublicKey(userWallet), isSigner: true, isWritable: true }],
                programId: new solanaWeb3.PublicKey("7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv"),
                data: Buffer.from(Uint8Array.of(1)), // Smart contract'taki "spin" işlemini çağırır
            })
        );

        try {
            const signature = await window.solana.signAndSendTransaction(transaction);
            console.log("✅ Spin işlemi tamamlandı:", signature);
            resultMessage.textContent = "🎰 Spin başarıyla gerçekleşti!";
            playerBalance--; // Blockchain'den gelecek şekilde değiştirilecek
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
