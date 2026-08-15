// js/ultimate_team.js - نظام الحفظ، البيع، التكتيكات والمباريات

let userCoins = parseInt(localStorage.getItem('embabi_coins')) || 5000000;
let mySquad = JSON.parse(localStorage.getItem('embabi_squad')) || [];
let activeFormation = localStorage.getItem('embabi_formation') || '4-3-3';

let boughtIds = mySquad.map(p => p.id);
let availableMarket = playersDatabase.filter(p => !boughtIds.includes(p.id));

function saveData() {
    localStorage.setItem('embabi_coins', userCoins);
    localStorage.setItem('embabi_squad', JSON.stringify(mySquad));
    localStorage.setItem('embabi_formation', activeFormation);
}

function renderMarket() {
    const marketEl = document.getElementById('market');
    if (!marketEl) return;

    const searchText = (document.getElementById('search-input')?.value || '').toLowerCase();
    const selectedPos = document.getElementById('pos-filter')?.value || 'ALL';

    const filtered = availableMarket.filter(p => {
        const matchesName = p.name.toLowerCase().includes(searchText);
        const matchesPos = selectedPos === 'ALL' || p.pos === selectedPos;
        return matchesName && matchesPos;
    });

    marketEl.innerHTML = '';
    filtered.forEach(p => {
        marketEl.innerHTML += `
            <div class="card ${p.category}">
                <div class="card-ovr">${p.ovr}</div>
                <span class="card-pos">${p.pos}</span>
                <div class="card-name">${p.name}</div>
                <div class="card-price">${p.price.toLocaleString()} 🪙</div>
                <button onclick="buyPlayer(${p.id})">شراء</button>
            </div>
        `;
    });
}

function buyPlayer(id) {
    const index = availableMarket.findIndex(p => p.id === id);
    if (index === -1) return;

    const player = availableMarket[index];

    if (userCoins >= player.price) {
        userCoins -= player.price;
        mySquad.push(player);
        availableMarket.splice(index, 1);
        
        saveData();
        updateUI();
    } else {
        alert("الكوينز غير كافية لشراء هذا اللاعب!");
    }
}

function sellPlayer(id) {
    const index = mySquad.findIndex(p => p.id === id);
    if (index === -1) return;

    const player = mySquad[index];
    const refundPrice = Math.round(player.price * 0.8);

    userCoins += refundPrice;
    availableMarket.push(player);
    mySquad.splice(index, 1);

    saveData();
    updateUI();
}

function changeFormation(formation) {
    activeFormation = formation;
    saveData();
    updateUI();
}

// محاكي المباريات
function playMatch() {
    if (mySquad.length < 11) {
        alert("يجب أن تمتلك 11 لاعباً على الأقل في تشكيلتك لخوض مباراة!");
        return;
    }

    const teamOvr = Math.round(mySquad.reduce((acc, p) => acc + p.ovr, 0) / mySquad.length);
    const opponentOvr = Math.floor(Math.random() * 15) + 80; // فريق منافس بـ OVR عشوائي

    const userGoals = Math.floor(Math.random() * (teamOvr / 20));
    const opponentGoals = Math.floor(Math.random() * (opponentOvr / 20));

    let reward = 0;
    let resultMsg = "";

    if (userGoals > opponentGoals) {
        reward = 250000;
        resultMsg = `🎉 فوز مستحق! النتيجة: ${userGoals} - ${opponentGoals}\nحصلت على مكافأة: ${reward.toLocaleString()} كوينز!`;
    } else if (userGoals === opponentGoals) {
        reward = 100000;
        resultMsg = `🤝 تعادل! النتيجة: ${userGoals} - ${opponentGoals}\nحصلت على مكافأة: ${reward.toLocaleString()} كوينز!`;
    } else {
        reward = 30000;
        resultMsg = `💔 خسارة! النتيجة: ${userGoals} - ${opponentGoals}\nحصلت على مكافأة مشاركة: ${reward.toLocaleString()} كوينز.`;
    }

    userCoins += reward;
    saveData();
    updateUI();
    alert(resultMsg);
}

function updateUI() {
    const coinsEl = document.getElementById('user-coins');
    if (coinsEl) coinsEl.innerText = userCoins.toLocaleString();

    const formDisplay = document.getElementById('active-formation-display');
    if (formDisplay) formDisplay.innerText = activeFormation;

    const formSelect = document.getElementById('formation-select');
    if (formSelect) formSelect.value = activeFormation;

    const squadEl = document.getElementById('squad');
    if (squadEl) {
        squadEl.innerHTML = '';
        if (mySquad.length === 0) {
            squadEl.innerHTML = `<p style="color: #cbd5e1; width: 100%;">التشكيلة فارغة! قم بشراء لاعبين من سوق المزادات بالأسفل.</p>`;
        } else {
            mySquad.forEach(p => {
                squadEl.innerHTML += `
                    <div class="card ${p.category}">
                        <div class="card-ovr">${p.ovr}</div>
                        <span class="card-pos">${p.pos}</span>
                        <div class="card-name">${p.name}</div>
                        <button style="background: #ef4444;" onclick="sellPlayer(${p.id})">بيع (${Math.round(p.price * 0.8).toLocaleString()})</button>
                    </div>
                `;
            });
        }
    }

    const ovrEl = document.getElementById('team-ovr');
    if (ovrEl) {
        const totalOvr = mySquad.length > 0 ? Math.round(mySquad.reduce((acc, p) => acc + p.ovr, 0) / mySquad.length) : 0;
        ovrEl.innerText = totalOvr;
    }

    renderMarket();
}

window.onload = () => {
    updateUI();
};
