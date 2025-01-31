// 📌 Buffer hatasını önlemek için
window.Buffer = window.Buffer || require("buffer").Buffer;

// ✅ Solana bağlantısı
const connection = new solanaWeb3.Connection("https://api.testnet.solana.com", "confirmed");

// ✅ 2JZ Coin mint adresi
const tokenMintAddress = new solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3M");

const houseWalletPublicKey = new solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");

// ✅ İlk 10.000 oyuncu kontrolü için liste
let playerList = [];
const maxPlayers = 10000;

// ✅ Phantom Wallet bağlantısı
const wallet = window.solana;

async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("❌ Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return false;
    }

    try {
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${playerAddress}`;
        console.log("✅ Wallet bağlandı:", playerAddress);

        // İlk defa bağlanan oyuncuya 20 coin ekle
        if (!playerList.includes(playerAddress) && playerList.length < maxPlayers) {
            playerList.push(playerAddress);
            await addInitialCoins(playerAddress);
            alert("🎉 Tebrikler! Oyuna 20 coin ile başladınız.");
        }
        return true;
    } catch (error) {
        console.error("❌ Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlanırken bir hata oluştu.");
        return false;
    }
}

// ✅ Oyuncuya başlangıç coini ekleme
async function addInitialCoins(playerAddress) {
    try {
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: houseWalletPublicKey,
                toPubkey: new solanaWeb3.PublicKey(playerAddress),
                lamports: 20 * solanaWeb3.LAMPORTS_PER_SOL, // 20 coin
            })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = houseWalletPublicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendTransaction(signedTransaction);
        await connection.confirmTransaction(signature, lastValidBlockHeight);

        console.log("✅ 20 coin başarıyla eklendi:", signature);
    } catch (error) {
        console.error("❌ 20 coin eklenirken hata oluştu:", error);
    }
}

// ✅ Kullanıcının 2JZ Coin bakiyesini sorgula
async function getUserBalance() {
    if (!wallet || !wallet.isPhantom) {
        alert("❌ Wallet bağlı değil!");
        return;
    }

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
            wallet.publicKey,
            { mint: tokenMintAddress }
        );

        if (accounts.value.length > 0) {
            let balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            console.log(`🔄 Kullanıcının 2JZ Coin Bakiyesi: ${balance}`);
            return balance;
        } else {
            console.log("⚠️ Kullanıcının bakiyesi yok!");
            return 0;
        }
    } catch (error) {
        console.error("❌ Bakiye alınırken hata oluştu:", error);
        return 0;
    }
}

// ✅ Deposit işlemi
async function depositCoins() {
    if (!wallet || !wallet.isPhantom) {
        alert("❌ Önce Phantom Wallet bağlamalısınız!");
        return;
    }

    let amount = prompt("Kaç coin yatırmak istiyorsunuz?", "100");
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        alert("⚠️ Geçerli bir miktar giriniz!");
        return;
    }

    console.log(`🔄 ${amount} coins depositing...`);

    try {
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: houseWalletPublicKey,
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
            })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signature = await wallet.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature, lastValidBlockHeight);

        alert(`✅ ${amount} coin yatırıldı!`);
    } catch (error) {
        console.error("❌ Deposit işlemi başarısız oldu:", error);
    }
}

// ✅ Withdraw işlemi
async function withdrawCoins() {
    if (!wallet || !wallet.isPhantom) {
        alert("❌ Önce Phantom Wallet bağlamalısınız!");
        return;
    }

    let amount = prompt("Kaç coin çekmek istiyorsunuz?", "50");
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        alert("⚠️ Geçerli bir miktar giriniz!");
        return;
    }

    console.log(`🔄 Blockchain üzerinden withdraw başlatılıyor: ${amount} coin`);

    try {
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: houseWalletPublicKey,
                toPubkey: wallet.publicKey,
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
            })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = houseWalletPublicKey;

        const signature = await wallet.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature, lastValidBlockHeight);

        alert(`✅ ${amount} coin başarıyla çekildi!`);
    } catch (error) {
        console.error("❌ Withdraw işlemi başarısız oldu:", error);
    }
}

// Export olmadan çalışacak şekilde ayarladık
window.connectWallet = connectWallet;
window.depositCoins = depositCoins;
window.withdrawCoins = withdrawCoins;
window.getUserBalance = getUserBalance;
