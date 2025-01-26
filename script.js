window.onload = function () {
    const connectButton = document.getElementById("connect-wallet-button");
    const walletAddressElement = document.getElementById("wallet-address");

    async function connectWallet() {
        if (!window.solana || !window.solana.isPhantom) {
            alert("Phantom Wallet bulunamadı. Lütfen yükleyin ve tekrar deneyin.");
            return;
        }

        try {
            const response = await window.solana.connect();
            const walletAddress = response.publicKey.toString();
            walletAddressElement.innerText = `Wallet: ${walletAddress}`;
            alert("Cüzdan başarıyla bağlandı!");
        } catch (error) {
            console.error("Cüzdan bağlantısı başarısız oldu:", error);
            alert("Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
        }
    }

    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    }
};
