import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const connection = new Connection('https://api.testnet.solana.com');
const wallet = window.solana;

// House wallet public key
const houseWalletPublicKey = new PublicKey('YOUR_HOUSE_WALLET_PUBLIC_KEY');

// Spin işlemi
async function spin() {
    if (!wallet) {
        alert("Please connect your wallet first.");
        return;
    }

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: houseWalletPublicKey,
            lamports: 1000, // 1 coin (lamports cinsinden)
        })
    );

    try {
        const signature = await wallet.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
        alert("Spin işlemi tamamlandı!");
    } catch (error) {
        console.error("Transaction failed:", error);
        alert("Spin işlemi başarısız oldu.");
    }
}
