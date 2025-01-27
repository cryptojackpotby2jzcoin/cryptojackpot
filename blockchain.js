// blockchain.js

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

const tokenMintAddress = new PublicKey('GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump');
const houseWalletPublicKey = new PublicKey('5dA8kKepycbZ43Zm3MuzRGro5KkkzoYusuqjz8MfTBwn');

let playerList = [];
const maxPlayers = 10000;
const wallet = window.solana;

async function connectWallet() {
    if (!wallet || !wallet.isPhantom) {
        alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
        return false;
    }

    try {
        const response = await wallet.connect();
        const playerAddress = response.publicKey.toString();
        document.getElementById("wallet-address").innerText = `Wallet: ${playerAddress}`;

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

async function addInitialCoins(playerAddress) {
    try {
        const playerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            tokenMintAddress,
            new PublicKey(playerAddress)
        );

        const houseTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            tokenMintAddress,
            houseWalletPublicKey
        );

        const transaction = new Transaction().add(
            createTransferInstruction(
                houseTokenAccount.address,
                playerTokenAccount.address,
                houseWalletPublicKey,
                20 * 1e9
            )
        );

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

async function transferSpinReward(playerAddress, rewardAmount) {
    try {
        const playerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            tokenMintAddress,
            new PublicKey(playerAddress)
        );

        const houseTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            tokenMintAddress,
            houseWalletPublicKey
        );

        const transaction = new Transaction().add(
            createTransferInstruction(
                houseTokenAccount.address,
                playerTokenAccount.address,
                houseWalletPublicKey,
                rewardAmount * 1e9
            )
        );

        transaction.feePayer = houseWalletPublicKey;
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        console.log(`${rewardAmount} coin başarıyla transfer edildi:", signature);
    } catch (error) {
        console.error("Ödül transferi sırasında hata oluştu:", error);
    }
}

export { connectWallet, addInitialCoins, transferSpinReward };
