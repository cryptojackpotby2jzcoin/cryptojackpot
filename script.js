import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

// Solana testnet bağlantısı
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// 2JZ Coin mint adresi
const tokenMintAddress = new PublicKey('GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump');

// House wallet public key (ödül havuzu cüzdan adresi)
const houseWalletPublicKey = new PublicKey('YOUR_HOUSE_WALLET_PUBLIC_KEY');

// İlk 10.000 oyuncu kontrolü için liste
let playerList = [];
const maxPlayers = 10000;

// Phantom Wallet bağlantısı
const wallet = window.solana;

// Oyuna girişte cüzdan bağlantısı
async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return false;
    }

    try {
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${playerAddress}`;

        // Oyuncuya ilk kez bağlanıyorsa 20 coin ekle
        if (!playerList.includes(playerAddress) && playerList.length < maxPlayers) {
            playerList.push(playerAddress);
            await addInitialCoins(playerAddress);
            alert("Tebrikler! Oyuna 20 coin ile başladınız.");
        }
        return true;
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlanırken bir hata oluştu.");
        return false;
    }
}

// Oyuncuya başlangıç coini ekleme (SPL Token transferi)
async function addInitialCoins(playerAddress) {
    try {
        // Kullanıcının token hesabını oluştur veya al
        const playerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet, // Wallet objesi, signTransaction için kullanılacak
            tokenMintAddress,
            new PublicKey(playerAddress)
        );

        // House wallet token hesabını oluştur veya al
        const houseTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            tokenMintAddress,
            houseWalletPublicKey
        );

        // Transfer işlemi için transaction oluştur
        const transaction = new Transaction().add(
            createTransferInstruction(
                houseTokenAccount.address, // Kaynak (house wallet)
                playerTokenAccount.address, // Hedef (player wallet)
                houseWalletPublicKey, // Authority (house wallet public key)
                20 * 1e9 // SPL token miktarı (1e9 = 1 token)
            )
        );

        // Transaction'ı signTransaction ile imzala
        transaction.feePayer = houseWalletPublicKey;
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        console.log("20 coin başarıyla eklendi:", signature);
    } catch (error) {
        console.error("20 coin eklenirken hata oluştu:", error);
    }
}

export { connectWallet };
