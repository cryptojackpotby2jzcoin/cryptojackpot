document.addEventListener("DOMContentLoaded", function () {
    const spinButton = document.getElementById("spin-button");
    let totalSpins = 0;
    let spinCounter = 0;

    spinButton.addEventListener("click", async function() {
        if (isSpinning) return;

        try {
            await window.solana.connect();
            const connection = new solanaWeb3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`, "confirmed");
            const programId = new solanaWeb3.PublicKey("EaQ7bsbPp8ffC1j96RjWkuiWr5YnpfcuPJo6ZNJaggXH");
            const userWallet = window.solana.publicKey;

            // Burada spin işlemini akıllı sözleşme üzerinden yapmanız gerekecek.
            // Spin işlemi sonucunda bakiye güncellenmeli.
            // Bu basitleştirilmiş bir örnek, gerçek uygulamada akıllı sözleşme ile etkileşim kurulmalı.

            const transaction = new solanaWeb3.Transaction();
            transaction.add(
                new solanaWeb3.TransactionInstruction({
                    keys: [{pubkey: userWallet, isSigner: true, isWritable: true}],
                    programId: programId,
                    data: Buffer.from([0]) // Spin işlemi için komut (örneğin)
                })
            );

            const signature = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            spinGame(); // Spin işlemini başlat
            totalSpins++;
            spinCounter++;
            document.getElementById("total-spins").innerText = totalSpins;
            document.getElementById("spin-counter").innerText = spinCounter;
        } catch (error) {
            console.error("❌ Spin failed:", error);
            alert("❌ Spin failed. Please try again.");
        }
    });
});
