import { Connection, PublicKey, Transaction, SystemProgram, Token } from '@solana/web3.js';

// Solana testnet bağlantısı
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// 2JZ Coin mint adresi (kendi coin mint adresini buraya ekle)
const tokenMintAddress = new PublicKey('2JZ_COIN_MINT_ADDRESS'); // Örnek: "57HY1trTTWrSDTonyhveXKdUDh2qH6HLWzkBnu3MGGQK"

// House wallet public key (ödül havuzunun cüzdan adresi)
const houseWalletPublicKey = new PublicKey('YOUR_HOUSE_WALLET_PUBLIC_KEY');

// Kullanıcının Phantom Wallet bağlantısını kontrol et
const wallet = window.solana;

// Cüzdan bağlama işlemi
async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return;
    }

    try {
        const response = await wallet.connect();
        console.log("Wallet connected:", response.publicKey.toString());
        alert("Cüzdan başarıyla bağlandı!");
    } catch (error) {
        console.error("Cüzdan bağlantısı başarısız oldu:", error);
        alert("Cüzdan bağlanırken bir hata oluştu.");
    }
}

// Kullanıcının 2JZ Coin bakiyesini kontrol et
async function get2JZBalance() {
    if (!wallet || !wallet.isConnected) {
        alert("Lütfen önce cüzdanınızı bağlayın.");
        return 0;
    }

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
            mint: tokenMintAddress,
        });

        if (accounts.value.length > 0) {
            const balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            console.log(`2JZ Coin Bakiyesi: ${balance}`);
            return balance;
        } else {
            alert("Cüzdanınızda 2JZ Coin bulunmuyor!");
            return 0;
        }
    } catch (error) {
        console.error("Bakiye kontrolü başarısız oldu:", error);
        alert("Bakiye kontrol edilirken bir hata oluştu.");
        return 0;
    }
}

// Spin işlemi (2JZ Coin kullanımı)
async function spin() {
    const balance = await get2JZBalance();
    if (balance <= 0) {
        alert("Spin işlemi için yeterli 2JZ Coin bakiyeniz yok!");
        return;
    }

    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: houseWalletPublicKey,
                lamports: 1000, // 1 coin = 1000 lamports
            })
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        // İşlemi imzala ve gönder
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        console.log("Transaction successful:", signature);
        alert("Spin işlemi tamamlandı!");
    } catch (error) {
        console.error("Transaction failed:", error);
        alert("Spin işlemi başarısız oldu. Lütfen tekrar deneyin.");
    }
}

export { connectWallet, get2JZBalance, spin };
