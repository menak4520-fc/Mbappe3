// js/ultimate_team.js - نظام الحفظ، البيع، والتشكيل التكتيكي

// 1. تحميل البيانات من ذاكرة المتصفح أو ضبط القيم الافتراضية
let userCoins = parseInt(localStorage.getItem('embabi_coins')) || 5000000;
let mySquad = JSON.parse(localStorage.getItem('embabi_squad')) || [];
let activeFormation = localStorage.getItem('embabi_formation') || '4-3-3';

// استبعاد اللاعبين المشتراة من سوق المزادات عند التحميل
let boughtIds = mySquad.map(p => p.id);
let availableMarket = playersDatabase.filter(p => !boughtIds.includes(p.id));

// 2. حفظ البيانات آلياً
function saveData() {
    localStorage.setItem('embabi_coins', userCoins);
    localStorage.setItem('embabi_squad', JSON.stringify(mySquad));
    localStorage.setItem('embabi_formation', activeFormation);
}

// 3. عرض سوق المزادات مع الفلترة والبحث
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

// 4. شراء لاعب
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

// 5. بيع لاعب وإعادته للسوق (استرجاع 80% من القيمة)
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

// 6. تغيير التكتيك
function changeFormation(formation) {
    activeFormation = formation;
    saveData();
    updateUI();
}

// 7. تحديث واجهة المستخدم بالكامل
function updateUI() {
    // تحديث الكوينز
    const coinsEl = document.getElementById('user-coins');
    if (coinsEl) coinsEl.innerText = userCoins.toLocaleString();

    // تحديث التشكيلة
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

    // حساب الـ OVR الإجمالي
    const ovrEl = document.getElementById('team-ovr');
    if (ovrEl) {
        const totalOvr = mySquad.length > 0 ? Math.round(mySquad.reduce((acc, p) => acc + p.ovr, 0) / mySquad.length) : 0;
        ovrEl.innerText = totalOvr;
    }

    renderMarket();
}

// تشغيل الواجهة عند فتح الصفحة
window.onload = () => {
    updateUI();
};
    <!-- 1. استدعاء قاعدة البيانات أولاً -->
    <script src="js/players.js"></script>

    <!-- 2. استدعاء ملف اللوجيك والحفظ -->
    <script src="js/ultimate_team.js"></script>
</body>
</html>
