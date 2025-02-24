document.addEventListener("DOMContentLoaded", function () {
  const connectWalletButton = document.getElementById("connect-wallet-button");
  const withdrawButton = document.getElementById("withdraw-button");
  const depositButton = document.getElementById("deposit-button");
  const spinButton = document.getElementById("spin-button");

  const programId = new window.solanaWeb3.PublicKey("EaQ7bsbPp8ffC1j96RjWkuiWr5YnpfcuPJo6ZNJaggXH");
  const houseWalletAddress = new window.solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");
  const tokenMint = new window.solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"); // 2JZ Coin mint adresi
  let userWallet = null;

  // Solana Devnet Endpoint (test için)
  const connection = new window.solanaWeb3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  // ---------------------------------------------------------------------
  // Yardımcı Fonksiyon: ComputeBudgetProgram.setComputeUnitPrice için
  function createSetComputeUnitPriceInstruction(microLamports) {
    const buffer = new ArrayBuffer(9); // 9 baytlık alan oluştur
    const view = new DataView(buffer);
    view.setUint8(0, 1); // 1: setComputeUnitPrice instruction indexi
    let value = BigInt(microLamports);
    for (let i = 0; i < 8; i++) {
      view.setUint8(1 + i, Number(value & 0xffn));
      value = value >> 8n;
    }
    return new window.solanaWeb3.TransactionInstruction({
      programId: window.solanaWeb3.ComputeBudgetProgram.programId,
      keys: [],
      data: new Uint8Array(buffer),
    });
  }
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // Yeni Yardımcı Fonksiyon: Güvenilir işlem gönderme
  async function sendTransactionWithRetry(instructions, walletInterface, connection) {
    try {
      // İşlem oluştur
      const tx = new window.solanaWeb3.Transaction();
      instructions.forEach((inst) => tx.add(inst));

      // Güncel blockhash al ve geçerlilik süresini genişlet
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = userWallet;

      // Phantom ile tek seferde imza al
      const signedTx = await walletInterface.signTransaction(tx);
      const serializedTx = signedTx.serialize();

      // İşlemi gönder ve onay bekle
      const signature = await connection.sendRawTransaction(serializedTx, {
        skipPreflight: false, // İşlem öncesi kontrol açık
        maxRetries: 5, // RPC tarafında 5 retry
      });

      // Onay için genişletilmiş block height ile bekle
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: lastValidBlockHeight + 300, // 300 block tampon (~2-3 dakika)
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error("Transaction failed: " + JSON.stringify(confirmation.value.err));
      }

      console.log("Transaction confirmed:", signature);
      return signature;
    } catch (error) {
      if (error.message.includes("block height exceeded")) {
        console.warn("Transaction expired due to block height, but retry handled by RPC.");
      } else {
        console.error("Transaction error:", error.message);
      }
      throw error;
    }
  }
  // ---------------------------------------------------------------------

  async function connectWallet() {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Phantom Wallet not found. Please install Phantom extension.");
      return;
    }
    try {
      const response = await window.solana.connect();
      userWallet = response.publicKey;
      document.getElementById("wallet-address").innerText = `Wallet: ${userWallet.toString()}`;
      await initializeUserAccount();
      await updateBalance();
      await updateRewardPool();
    } catch (error) {
      console.error("❌ Wallet connection failed:", error.message, error.stack);
      alert("Wallet connection failed: " + error.message);
    }
  }

  async function initializeUserAccount() {
    if (!userWallet) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("user"), userWallet.toBytes()],
        programId
      );
      const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("game_state")],
        programId
      );

      let accountInfo;
      try {
        accountInfo = await connection.getAccountInfo(userAccountPDA);
      } catch (e) {
        console.warn("Failed to check account info, proceeding anyway:", e.message);
      }
      if (accountInfo) {
        console.log("✅ User account already initialized:", userAccountPDA.toString());
        return;
      }

      const instructions = [];
      instructions.push(createSetComputeUnitPriceInstruction(1000000)); // 1 lamport priority fee
      instructions.push(
        new window.solanaWeb3.TransactionInstruction({
          keys: [
            { pubkey: userAccountPDA, isSigner: false, isWritable: true },
            { pubkey: gameStatePDA, isSigner: false, isWritable: true },
            { pubkey: userWallet, isSigner: true, isWritable: true },
            { pubkey: window.solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([0]), // Initialize instruction
        })
      );

      console.log("Please approve the transaction in Phantom within 60 seconds to initialize your account...");
      const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
      console.log("Transaction signature:", signature);
      console.log("✅ User account initialized:", signature);
    } catch (error) {
      console.error("❌ Initialization failed:", error.message, error.stack);
      if (error.message.includes("block height exceeded")) {
        alert("Transaction expired! Please try again and approve within 60 seconds in Phantom.");
      } else if (error.message.includes("User rejected")) {
        alert("You rejected the transaction. Please approve it to initialize your account.");
      } else if (error.message.includes("UNAUTHORIZED")) {
        alert("RPC access denied. Please check your endpoint or contact support.");
      } else {
        alert("Failed to initialize account: " + error.message);
      }
      throw error;
    }
  }

  async function updateBalance() {
    if (!userWallet) return;
    try {
      const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("user"), userWallet.toBytes()],
        programId
      );
      const accountInfo = await connection.getAccountInfo(userAccountPDA);
      if (accountInfo) {
        const balance = Number(accountInfo.data.readBigUInt64LE(8)) / 1_000_000;
        document.getElementById("player-balance").innerText = `Your Balance: ${balance.toLocaleString()} 2JZ Coins ($0.0000)`;
        document.getElementById("earned-coins").innerText = `Earned Coins: ${balance.toLocaleString()} 2JZ Coins ($0.0000)`;
      } else {
        document.getElementById("player-balance").innerText = `Your Balance: 0 2JZ Coins ($0.0000)`;
        document.getElementById("earned-coins").innerText = `Earned Coins: 0 2JZ Coins ($0.0000)`;
      }
    } catch (error) {
      console.error("❌ Balance update failed:", error.message, error.stack);
      document.getElementById("player-balance").innerText = `Your Balance: Error`;
    }
  }

  async function depositCoins() {
    if (!userWallet) {
      alert("Please connect your wallet first!");
      return;
    }
    const amount = parseFloat(prompt("Enter 2JZ Coins to deposit (max 10,000,000):"));
    if (amount <= 0 || amount > 10000000 || isNaN(amount)) {
      alert("❌ Invalid deposit amount!");
      return;
    }
    try {
      const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("user"), userWallet.toBytes()],
        programId
      );
      const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("game_state")],
        programId
      );
      const userTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, userWallet);
      const houseTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, houseWalletAddress);

      const instructions = [];
      instructions.push(createSetComputeUnitPriceInstruction(1000000)); // 1 lamport priority fee
      const userTokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
      if (!userTokenAccountInfo) {
        instructions.push(
          window.splToken.createAssociatedTokenAccountInstruction(
            userWallet,
            userTokenAccount,
            userWallet,
            tokenMint
          )
        );
      }
      const houseTokenAccountInfo = await connection.getAccountInfo(houseTokenAccount);
      if (!houseTokenAccountInfo) {
        instructions.push(
          window.splToken.createAssociatedTokenAccountInstruction(
            userWallet,
            houseTokenAccount,
            houseWalletAddress,
            tokenMint
          )
        );
      }
      instructions.push(
        new window.solanaWeb3.TransactionInstruction({
          keys: [
            { pubkey: userAccountPDA, isSigner: false, isWritable: true },
            { pubkey: gameStatePDA, isSigner: false, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: true },
            { pubkey: houseTokenAccount, isSigner: false, isWritable: true },
            { pubkey: userWallet, isSigner: true, isWritable: false },
            { pubkey: window.splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([
            1,
            ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * 1_000_000))]).buffer)
          ]),
        })
      );
      console.log("Please approve the deposit transaction in Phantom within 60 seconds...");
      const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
      console.log("Deposit transaction signature:", signature);
      alert(`✅ Deposited ${amount} 2JZ Coins!`);
      await updateBalance();
    } catch (error) {
      console.error("❌ Deposit failed:", error.message, error.stack);
      if (error.message.includes("block height exceeded")) {
        alert("Transaction expired! Please try again and approve within 60 seconds in Phantom.");
      } else if (error.message.includes("User rejected")) {
        alert("You rejected the deposit transaction. Please approve it to continue.");
      } else if (error.message.includes("UNAUTHORIZED")) {
        alert("RPC access denied. Please check your endpoint or contact support.");
      } else {
        alert(`Deposit failed: ${error.message}`);
      }
      throw error;
    }
  }

  async function withdrawCoins() {
    if (!userWallet) {
      alert("Please connect your wallet first!");
      return;
    }
    const amount = parseFloat(prompt("Enter 2JZ Coins to withdraw:"));
    if (amount <= 0 || isNaN(amount)) {
      alert("❌ Invalid withdraw amount!");
      return;
    }
    try {
      const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("user"), userWallet.toBytes()],
        programId
      );
      const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("game_state")],
        programId
      );
      const userTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, userWallet);
      const houseTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, houseWalletAddress);

      const instructions = [];
      instructions.push(createSetComputeUnitPriceInstruction(1000000)); // 1 lamport priority fee
      instructions.push(
        new window.solanaWeb3.TransactionInstruction({
          keys: [
            { pubkey: userAccountPDA, isSigner: false, isWritable: true },
            { pubkey: gameStatePDA, isSigner: false, isWritable: true },
            { pubkey: houseTokenAccount, isSigner: false, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: true },
            { pubkey: userWallet, isSigner: true, isWritable: false },
            { pubkey: window.splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([
            3,
            ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * 1_000_000))]).buffer)
          ]),
        })
      );
      console.log("Please approve the withdraw transaction in Phantom within 60 seconds...");
      const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
      console.log("Withdraw transaction signature:", signature);
      alert(`✅ Withdrawn ${amount} 2JZ Coins!`);
      await updateBalance();
    } catch (error) {
      console.error("❌ Withdraw failed:", error.message, error.stack);
      if (error.message.includes("block height exceeded")) {
        alert("Transaction expired! Please try again and approve within 60 seconds in Phantom.");
      } else if (error.message.includes("User rejected")) {
        alert("You rejected the withdraw transaction. Please approve it to continue.");
      } else if (error.message.includes("UNAUTHORIZED")) {
        alert("RPC access denied. Please check your endpoint or contact support.");
      } else {
        alert(`Withdraw failed: ${error.message}`);
      }
      throw error;
    }
  }

  async function spinGameOnChain() {
    if (!userWallet) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      const [userAccountPDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("user"), userWallet.toBytes()],
        programId
      );
      const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("game_state")],
        programId
      );
      const instructions = [];
      instructions.push(createSetComputeUnitPriceInstruction(1000000)); // 1 lamport priority fee
      instructions.push(
        new window.solanaWeb3.TransactionInstruction({
          keys: [
            { pubkey: userAccountPDA, isSigner: false, isWritable: true },
            { pubkey: gameStatePDA, isSigner: false, isWritable: true },
            { pubkey: userWallet, isSigner: true, isWritable: false },
          ],
          programId,
          data: Buffer.from([2]),
        })
      );
      console.log("Please approve the spin transaction in Phantom within 60 seconds...");
      const signature = await sendTransactionWithRetry(instructions, window.solana, connection);
      console.log("Spin transaction signature:", signature);
      await updateBalance();
      spinGame(); // Frontend spin animasyonu
      window.dispatchEvent(new Event("spinComplete"));
    } catch (error) {
      console.error("❌ Spin failed:", error.message, error.stack);
      if (error.message.includes("block height exceeded")) {
        alert("Transaction expired! Please try again and approve within 60 seconds in Phantom.");
      } else if (error.message.includes("User rejected")) {
        alert("You rejected the spin transaction. Please approve it to continue.");
      } else if (error.message.includes("UNAUTHORIZED")) {
        alert("RPC access denied. Please check your endpoint or contact support.");
      } else {
        alert("Spin failed: " + error.message);
      }
      throw error;
    }
  }

  async function updateRewardPool() {
    try {
      const [gameStatePDA] = await window.solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("game_state")],
        programId
      );
      const accountInfo = await connection.getAccountInfo(gameStatePDA);
      if (accountInfo && accountInfo.data) {
        const houseBalance = Number(accountInfo.data.readBigUInt64LE(16)) / 1_000_000;
        if (houseBalance > 0) {
          const rewardPool = houseBalance / 10;
          document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: ${rewardPool.toLocaleString()} 2JZ Coins ($74.99)`;
        } else {
          document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 2JZ Coins ($0.00)`;
        }
      } else {
        document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: 0 2JZ Coins ($0.00) (Account not initialized)`;
      }
    } catch (error) {
      console.error("❌ Reward pool update failed:", error.message, error.stack);
      document.getElementById("weekly-reward").innerText = `Weekly Reward Pool: Error`;
    }
  }

  // Event Listeners
  connectWalletButton.addEventListener("click", connectWallet);
  depositButton.addEventListener("click", depositCoins);
  withdrawButton.addEventListener("click", withdrawCoins);
  spinButton.addEventListener("click", spinGameOnChain);
});
