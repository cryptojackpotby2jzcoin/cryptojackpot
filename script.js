// Buffer Hatasını Önlemek İçin  
(async () => {
    window.Buffer = window.Buffer || (await import("buffer")).Buffer;
})();

document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");

    let userWallet = null;
    let playerBalance = 0;
    let temporaryBalance = 0;  // Kazanılan coinleri tutar
    const programId = new solanaWeb3.PublicKey("7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv"); // Smart Contract ID
    const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");

    // ✅ CÜZDAN BAĞLAMA  
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

    // ✅ BAKİYE GÖRÜNTÜLEME  
    async function getBalance() {
        console.log("🔄 Bakiyeniz alınıyor...");
        playerBalance = 100; // Smart Contract'a bağlanınca değiştirilecek
        updateBalances();
    }

    // ✅ DEPOSIT (COİN YATIRMA)  
    async function depositCoins() {
        if (!userWallet) {
            alert("⚠️ Wallet bağlamadan deposit yapamazsınız!");
            return;
        }

        let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
        amount = parseInt(amount);
        if (isNaN(amount) || amount <= 0) {
            alert("⚠️ Lütfen geçerli bir sayı girin!");
            return;
        }

        console.log(`🔄 ${amount} coins depositing...`);
        playerBalance += amount;
        alert(`✅ ${amount} coin deposit edildi!`);
        updateBalances();
    }

    // ✅ SPİN İŞLEMİ  
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
                    data: new Uint8Array([1]), // Smart Contract'taki "spin" işlemini çağırır
                })
            );

            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = new solanaWeb3.PublicKey(userWallet);

            const signedTransaction = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature, "confirmed");

            console.log("✅ Spin işlemi tamamlandı:", signature);
            resultMessage.textContent = "🎰 Spin başarıyla gerçekleşti!";
            playerBalance--; // Blockchain'den gelecek şekilde değiştirilecek
            updateBalances();
        } catch (error) {
            console.error("❌ Spin işlemi başarısız oldu:", error);
            alert("Spin sırasında hata oluştu.");
        }
    }

    // ✅ COİN ÇEKME (WITHDRAW)  
    async function withdrawCoins() {
        if (!userWallet) {
            alert("⚠️ Önce wallet bağlamalısınız!");
            return;
        }

        if (temporaryBalance <= 0) {
            alert("⚠️ Çekilecek coin yok!");
            return;
        }

        let amount = temporaryBalance;
        console.log(`🔄 Blockchain üzerinden withdraw başlatılıyor: ${amount} coin`);
        alert(`✅ ${amount} coin Phantom Wallet'a gönderildi!`);
        temporaryBalance = 0;
        updateBalances();
    }

    // ✅ BAKİYELERİ GÜNCELLEME  
    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins`;
    }

    // 📌 EVENT LISTENERS (BUTON TIKLAMALARI)  
    connectWalletButton.addEventListener("click", connectWallet);
    spinButton.addEventListener("click", spin);
    depositButton.addEventListener("click", depositCoins);
    withdrawButton.addEventListener("click", withdrawCoins);

    updateBalances();
});
