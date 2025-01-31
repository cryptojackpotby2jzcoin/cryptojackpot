document.addEventListener("DOMContentLoaded", function () {
    const connectWalletButton = document.getElementById("connect-wallet-button");
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const depositButton = document.getElementById("deposit-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");

    let userWallet = null;
    let playerBalance = 0;
    let temporaryBalance = 0;

    const programId = new solanaWeb3.PublicKey("7eJ8iFsuwmVYr1eh6yg7VdMXD9CkKvFC52mM1z1JJeQv"); // Smart Contract ID
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed");

    // ✅ CÜZDAN BAĞLAMA
    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWallet = response.publicKey;
                document.getElementById("wallet-address").innerText = `Wallet: ${userWallet.toString()}`;
                console.log("✅ Wallet bağlandı:", userWallet.toString());
                await getBalance();
            } catch (error) {
                console.error("❌ Wallet bağlantısı başarısız oldu:", error);
                alert("Wallet bağlantısı başarısız oldu, lütfen tekrar deneyin.");
            }
        } else {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        }
    }

    // ✅ BAKİYEYİ GÖRÜNTÜLEME
    async function getBalance() {
        console.log("🔄 Bakiyeniz alınıyor...");
        playerBalance = 100; // Smart Contract'a bağlanınca güncellenecek
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

    // ✅ SPİN İŞLEMİ (BLOCKCHAIN UYUMLU)
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
            const instruction = new solanaWeb3.TransactionInstruction({
                keys: [{ pubkey: userWallet, isSigner: true, isWritable: true }],
                programId: programId,
                data: new Uint8Array([1]), // Buffer yerine Uint8Array kullanıldı
            });

            const transaction = new solanaWeb3.Transaction().add(instruction);
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.feePayer = userWallet;

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
