document.addEventListener("DOMContentLoaded", function () {
  const connectWalletButton = document.getElementById("connect-wallet-button");
  const withdrawButton = document.getElementById("withdraw-button");
  const depositButton = document.getElementById("deposit-button");
  const spinButton = document.getElementById("spin-button");

  const programId = new window.solanaWeb3.PublicKey("EaQ7bsbPp8ffC1j96RjWkuiWr5YnpfcuPJo6ZNJaggXH");
  const houseWalletAddress = new window.solanaWeb3.PublicKey("6iRYHMLHpUBrcnfdDpLGvCwRutgz4ZAjJMSvPJsYZDmF");
  const tokenMint = new window.solanaWeb3.PublicKey("GRjLQ8KXegtxjo5P2C2Gq71kEdEk3mLVCMx4AARUpump"); // 2JZ Coin mint adresi
  let userWallet = null;

  const connection = new window.solanaWeb3.Connection(
    "https://indulgent-empty-crater.solana-mainnet.quiknode.pro/34892d10273f2bbafc5c4d29e7114a530226dd29/QN_a412f1b56b2641028b059eabc49832fc",
    "confirmed"
  );

  function createSetComputeUnitPriceInstruction(microLamports) {
    const buffer = new ArrayBuffer(9);
    const view = new DataView(buffer);
    view.setUint8(0, 1);
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

  async function sendTransactionWithRetry(instructions, walletInterface, connection) {
    try {
      const tx = new window.solanaWeb3.Transaction();
      instructions.forEach((inst) => tx.add(inst));

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = userWallet;

      console.log("Transaction prepared, awaiting Phantom signature...");
      const signedTx = await walletInterface.signTransaction(tx);
      const serializedTx = signedTx.serialize();

      console.log("Sending transaction to Mainnet...");
      const signature = await connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        maxRetries: 5,
      });

      console.log("Waiting for confirmation...");
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: lastValidBlockHeight + 300,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error("Transaction failed: " + JSON.stringify(confirmation.value.err));
      }

      console.log("Transaction confirmed:", signature);
      return signature;
    } catch (error) {
      console.error("Transaction error:", error.message, error.stack);
      throw error;
    }
  }

  async function connectWallet() {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Phantom Wallet not found. Please install Phantom extension.");
      return;
    }
    try {
      const response = await window.solana.connect();
      userWallet = response.publicKey;
      console.log("Connected wallet:", userWallet.toBase58());
      document.getElementById("wallet-address").innerText = `Wallet: ${userWallet.toString()}`;

      // SOL kontrolü
      const balance = await connection.getBalance(userWallet);
      console.log("Wallet SOL balance:", balance / 1e9, "SOL");

      // Token kontrolü (eğer spl-token yüklüyse)
      try {
        if (window.splToken && window.splToken.getAssociatedTokenAddress) {
          const userTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, userWallet);
          try {
            const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
            console.log("Wallet 2JZ Coin balance:", tokenBalance.value.uiAmount, "2JZ Coins");
          } catch (e) {
            console.warn("No 2JZ Coin account found or token not deployed on Mainnet.");
          }
        } else {
          console.error("spl-token library is not loaded. Please include <script src='https://unpkg.com/@solana/spl-token@0.3.7/lib/index.iife.min.js'></script> in your HTML.");
        }
      } catch (error) {
        console.warn("Token check failed, skipping:", error.message);
      }

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

      console.log("User PDA:", userAccountPDA.toBase58());
      console.log("Game State PDA:", gameStatePDA.toBase58());

      let accountInfo;
      try {
        accountInfo = await connection.getAccountInfo(userAccountPDA);
      } catch (e) {
        console.warn("Failed to check account info:", e.message);
      }
      if (accountInfo) {
        console.log("✅ User account already initialized:", userAccountPDA.toBase58());
        return;
      }

      const instructions = [];
      instructions.push(createSetComputeUnitPriceInstruction(2000000)); // 2 lamport
      instructions.push(
        new window.solanaWeb3.TransactionInstruction({
          keys: [
            { pubkey: userAccountPDA, isSigner: false, isWritable: true },
            { pubkey: gameStatePDA, isSigner: false, isWritable: true },
            { pubkey: userWallet, isSigner: true, isWritable: true },
            { pubkey: window.solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([0]), // initialize: index 0
        })
      );

      console.log("Instruction data for initialize:", Buffer.from([0]).toString('hex'));
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
      } else if (error.message.includes("invalid instruction data")) {
        alert("Invalid instruction data! Check your smart contract’s initialize function and programId.");
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
      let userTokenAccount;
      try {
        userTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, userWallet);
      } catch (e) {
        console.error("Failed to get token account, token may not be deployed on Mainnet:", e.message);
        alert("2JZ Coin issue on Mainnet. Check token deployment or balance.");
        return;
      }
      const houseTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, houseWalletAddress);

      const instructions = [];
      instructions.push(createSetComputeUnitPriceInstruction(2000000));
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
          data: Buffer.from([1, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * 1_000_000))]).buffer)]),
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
      let userTokenAccount;
      try {
        userTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, userWallet);
      } catch (e) {
        console.error("Failed to get token account, token may not be deployed on Mainnet:", e.message);
        alert("2JZ Coin issue on Mainnet. Check token deployment or balance.");
        return;
      }
      const houseTokenAccount = await window.splToken.getAssociatedTokenAddress(tokenMint, houseWalletAddress);

      const instructions = [];
      instructions.push(createSetComputeUnitPriceInstruction(2000000));
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
          data: Buffer.from([2, ...new Uint8Array(new BigUint64Array([BigInt(Math.floor(amount * 1_000_000))]).buffer)]),
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
      instructions.push(createSetComputeUnitPriceInstruction(2000000));
      instructions.push(
        new window.solanaWeb3.TransactionInstruction({
          keys: [
            { pubkey: userAccountPDA, isSigner: false, isWritable: true },
            { pubkey: gameStatePDA, isSigner: false, isWritable: true },
            { pubkey: userWallet, isSigner: true, isWritable: false },
          ],
          programId,
          data: Buffer.from([3]),
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

  connectWalletButton.addEventListener("click", connectWallet);
  depositButton.addEventListener("click", depositCoins);
  withdrawButton.addEventListener("click", withdrawCoins);
  spinButton.addEventListener("click", spinGameOnChain);
});
