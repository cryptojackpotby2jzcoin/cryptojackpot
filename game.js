/* Gövde (Body) */
body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: black; /* Siyah arka plan */
    font-family: 'Press Start 2P', monospace;
    color: #FFFFFF;
    margin: 0;
    overflow: hidden; /* Kaydırmayı engelle */
}

/* Makine Çerçevesi */
.machine {
    padding: 20px; /* Sabit iç boşluk */
    background: black; /* Siyah arka plan */
    border-radius: 20px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 600px; /* Sabit genişlik */
    height: 800px; /* Sabit yükseklik */
    box-sizing: border-box; /* İç kenar boşluklarını hesaba kat */
}

/* Başlık */
h2 {
    text-align: center;
    font-size: 24px; /* Sabit yazı boyutu */
    color: #00FF00;
    margin-bottom: 10px;
    word-wrap: break-word; /* Uzun yazıları böl */
}

/* Balance Listesi */
.balance-list {
    list-style: none;
    margin-bottom: -10px;
    text-align: center;
    font-size: 18px; /* Sabit yazı boyutu */
    padding-left: 0px;
}

.balance-list li {
    margin-bottom: 5px;
}

#weekly-reward, #leaderboard {
    font-size: 16px; /* Sabit yazı boyutu */
    color: #00FF00;
}

/* Slot Makinesi Tasarımı */
.container {
    display: flex;
    justify-content: space-around;
    width: 100%; /* Tam genişlik */
    margin-top: 10px;
}

.slot {
    flex: 1;
    margin: 0 5px; /* Sabit boşluk */
    height: 150px; /* Sabit slot yüksekliği */
    background-color: #d6d6d6;
    border: 4px solid #fff; /* Sabit kenarlık */
    border-radius: 10px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

/* Kazanan Slot Efekti */
.winning-slot {
    animation: flash 0.8s infinite alternate; /* Yeşil yanıp sönme efekti */
    border-color: #00FF00;
    box-shadow: 0 0 20px #00FF00, 0 0 40px #00FF00;
}

@keyframes flash {
    0% {
        border-color: #00FF00;
        box-shadow: 0 0 10px #00FF00, 0 0 20px #00FF00;
    }
    100% {
        border-color: #FFFFFF;
        box-shadow: 0 0 20px #FFFFFF, 0 0 40px #FFFFFF;
    }
}

/* Balance ve Spin Counter Bölümü */
#balance-section {
    text-align: center;
    margin: 15px 0;
}

#player-balance,
#earned-coins,
#spin-counter {
    font-size: 16px; /* Sabit yazı boyutu */
    text-align: center;
    margin-bottom: 10px;
    color: #00FF00;
}

/* Butonlar */
.button-container {
    display: flex;
    justify-content: center; /* Ortalar */
    align-items: center;
    flex-direction: column; /* Dikey hizalama */
    gap: 15px; /* Butonlar arası boşluk */
    margin-top: 20px; /* Slotların altındaki boşluk */
}

/* Tek tek butonlar */
#transfer-button,
#buy-coin-button,
#withdraw-button {
    width: 150px; /* Sabit genişlik */
    height: 40px; /* Sabit yükseklik */
    font-size: 14px; /* Sabit yazı boyutu */
    border-radius: 8px;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;
}

.green-button {
    background-color: #32cd32;
    color: white;
}

#buy-coin-button {
    background-color: #FFD700;
    color: black;
}

#withdraw-button {
    background-color: #FF416C;
    color: white;
}

/* Spin Butonu */
#spin-button {
    width: 120px; /* Sabit genişlik */
    height: 120px; /* Sabit yükseklik */
    background-image: url('https://i.imgur.com/7N2Lyw9.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    background-color: transparent;
    border: none;
    margin-top: 20px; /* Buton grubunun altına boşluk */
}

/* Kazanma/Kaybetme Mesajı */
#result-message {
    margin-top: 20px;
    font-size: 16px; /* Sabit yazı boyutu */
    color: #FFFF00;
    text-align: center;
}
