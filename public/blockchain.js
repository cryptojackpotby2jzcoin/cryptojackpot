<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crypto Jackpot</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://unpkg.com/@solana/web3.js@1.78.0/lib/index.iife.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@solana/spl-token@0.3.8/lib/index.iife.min.js"></script>
</head>
<body>
    <div class="machine">
        <h2>Crypto Jackpot by 2JZ Coin</h2>
        <p id="weekly-reward">Weekly Reward Pool: Loading...</p>

        <div class="container">
            <div class="slot"></div>
            <div class="slot"></div>
            <div class="slot"></div>
        </div>

        <p id="result-message">Try your luck!</p>

        <div class="button-container">
            <div class="left-buttons">
                <button id="connect-wallet-button">Connect Wallet</button>
                <button id="deposit-button" disabled>Deposit Coins</button>
                <button id="transfer-button" disabled>Transfer Coins</button>
                <button id="withdraw-button" disabled>Withdraw Coins</button>
            </div>
            <div class="right-button">
                <button id="spin-button" disabled></button>
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
            <p><span id="player-balance">Your Balance: Loading...</span></p>
            <p><span id="earned-coins">Earned Coins: 0 Coins</span></p>
        </div>

        <div id="leaderboard">
            <p>Top Player Prizes:</p>
            <ul>
                <li>1st: <span id="first-spin-count">0</span> Coins</li>
                <li>2nd: <span id="second-spin-count">0</span> Coins</li>
                <li>3rd: <span id="third-spin-count">0</span> Coins</li>
            </ul>
        </div>
    </div>

    <script src="blockchain.js" type="module"></script>
    <!-- <script src="game.js"></script> -->
    <!-- <script src="script.js"></script> -->
</body>
</html>