<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crypto Jackpot</title>
    <link rel="stylesheet" href="style.css">
    
    <!-- Buffer Polyfill (elle tanımlama ile destek) -->
    <script>
        if (typeof Buffer === 'undefined') {
            window.Buffer = require('buffer/').Buffer;
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/buffer@6.0.3/dist/buffer.min.js"></script>
    
    <!-- Solana Web3.js -->
    <script src="https://unpkg.com/@solana/web3.js@1.73.0/lib/index.iife.min.js"></script>
    
    <!-- Solana SPL Token (2JZ Coin için gerekli) -->
    <script src="https://unpkg.com/@solana/spl-token@0.3.7/lib/index.iife.min.js"></script>

    <!-- JavaScript Dosyaları -->
    <script src="blockchain.js" defer></script>
    <script src="script.js" defer></script>
    <script src="game.js" defer></script>
</head>
<body>
    <div class="machine">
        <h2>Crypto Jackpot by 2JZ Coin</h2>
        <p id="weekly-reward">Weekly Reward Pool: 13,200,000 Coins ($74.99)</p>

        <div class="container">
            <div class="slot"></div>
            <div class="slot"></div>
            <div class="slot"></div>
        </div>

        <p id="result-message">Try your luck!</p>

        <div class="button-container">
            <div class="left-buttons">
                <button id="connect-wallet-button">Connect Wallet</button>
                <button id="deposit-button">Deposit Coins</button>
                <button id="transfer-button">Transfer Coins</button>
                <button id="withdraw-button">Withdraw Coins</button>
            </div>
            <div class="right-button">
                <button id="spin-button"></button>
            </div>
        </div>

        <div id="wallet-info">
            <p id="wallet-address">Wallet: N/A</p>
        </div>

        <div id="spin-info">
            <p>
                <span id="total-spins-label">Total Spins: <span id="total-spins">0</span></span>
                <span id="spin-counter-label"> Spin: <span id="spin-counter">0</span></span>
            </p>
        </div>

        <div id="balance-section">
            <p><span id="player-balance">Your Balance: 0 Coins ($0.0000)</span></p>
            <p><span id="earned-coins">Earned Coins: 0 Coins ($0.0000)</span></p>
        </div>

        <div id="leaderboard">
            <p>Top Player Prizes:</p>
            <ul>
                <li>1st: 6,600,000 Coins ($37.50) Spins: <span id="first-spin-count">0</span></li>
                <li>2nd: 3,960,000 Coins ($22.50) Spins: <span id="second-spin-count">0</span></li>
                <li>3rd: 2,640,000 Coins ($15.00) Spins: <span id="third-spin-count">0</span></li>
            </ul>
        </div>
    </div>
</body>
</html>
