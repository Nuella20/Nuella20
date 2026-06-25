// Game State
const gameState = {
    balance: 0,
    totalEarned: 0,
    perClick: 1,
    perSecond: 0,
    upgrades: {},
    workers: {},
    cosmetics: {},
    selectedTheme: 'default'
};

// Shop Data
const UPGRADES = {
    'better-fingers': {
        name: 'Better Fingers',
        description: 'Double-click power!',
        basePrice: 10,
        priceIncrease: 1.15,
        effect: 1
    },
    'golden-touch': {
        name: 'Golden Touch',
        description: '+$5 per click',
        basePrice: 50,
        priceIncrease: 1.15,
        effect: 5
    },
    'super-boost': {
        name: 'Super Boost',
        description: '+$20 per click',
        basePrice: 200,
        priceIncrease: 1.15,
        effect: 20
    },
    'mega-power': {
        name: 'Mega Power',
        description: '+$100 per click',
        basePrice: 1000,
        priceIncrease: 1.15,
        effect: 100
    }
};

const WORKERS = {
    'intern': {
        name: 'Intern',
        description: 'Earns $1/sec',
        basePrice: 50,
        priceIncrease: 1.15,
        perSecond: 1
    },
    'employee': {
        name: 'Employee',
        description: 'Earns $5/sec',
        basePrice: 250,
        priceIncrease: 1.15,
        perSecond: 5
    },
    'manager': {
        name: 'Manager',
        description: 'Earns $20/sec',
        basePrice: 1200,
        priceIncrease: 1.15,
        perSecond: 20
    },
    'ceo': {
        name: 'CEO',
        description: 'Earns $100/sec',
        basePrice: 5000,
        priceIncrease: 1.15,
        perSecond: 100
    }
};

const COSMETICS = {
    'theme-dark': {
        name: 'Dark Theme',
        emoji: '🌙',
        price: 99,
        type: 'theme'
    },
    'theme-ocean': {
        name: 'Ocean Theme',
        emoji: '🌊',
        price: 99,
        type: 'theme'
    },
    'theme-sunset': {
        name: 'Sunset Theme',
        emoji: '🌅',
        price: 99,
        type: 'theme'
    },
    'click-sound': {
        name: 'Click Sound',
        emoji: '🔊',
        price: 49,
        type: 'sound'
    }
};

// Initialize Game
function initGame() {
    loadGame();
    renderUpgrades();
    renderWorkers();
    renderCosmetics();
    updateDisplay();
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            const tabName = e.target.getAttribute('data-tab');
            document.getElementById(tabName).classList.add('active');
        });
    });
    
    // Click button
    document.getElementById('clickButton').addEventListener('click', click);
    
    // Footer buttons
    document.getElementById('resetButton').addEventListener('click', resetGame);
    document.getElementById('exportButton').addEventListener('click', exportGame);
    document.getElementById('importButton').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', importGame);
    
    // Passive income
    setInterval(passiveIncome, 100);
    
    // Auto-save
    setInterval(saveGame, 10000);
}

// Click function
function click() {
    const amount = gameState.perClick;
    gameState.balance += amount;
    gameState.totalEarned += amount;
    
    // Show feedback
    const feedback = document.getElementById('clickFeedback');
    feedback.textContent = `+$${amount}`;
    feedback.classList.remove('show');
    void feedback.offsetWidth; // Trigger reflow
    feedback.classList.add('show');
    
    // Button animation
    const button = document.getElementById('clickButton');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 50);
    
    updateDisplay();
    saveGame();
}

// Passive income from workers
function passiveIncome() {
    const income = gameState.perSecond / 10; // Called 10x per second
    gameState.balance += income;
    gameState.totalEarned += income;
    updateDisplay();
}

// Update display
function updateDisplay() {
    document.getElementById('balance').textContent = `$${formatNumber(gameState.balance)}`;
    document.getElementById('perClick').textContent = `$${gameState.perClick}`;
    document.getElementById('perSecond').textContent = `$${gameState.perSecond}`;
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

// Render upgrades shop
function renderUpgrades() {
    const shop = document.getElementById('upgradesShop');
    shop.innerHTML = '';
    
    Object.entries(UPGRADES).forEach(([key, upgrade]) => {
        const owned = gameState.upgrades[key] || 0;
        const price = upgrade.basePrice * Math.pow(upgrade.priceIncrease, owned);
        const affordable = gameState.balance >= price;
        
        const item = document.createElement('div');
        item.className = `shop-item ${affordable ? 'affordable' : ''}`;
        item.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${upgrade.name}</div>
                <div class="shop-item-desc">${upgrade.description}</div>
                <div class="shop-item-owned">Owned: ${owned}</div>
            </div>
            <button class="shop-item-button ${affordable ? 'affordable' : 'unaffordable'}">
                $${formatNumber(price)}
            </button>
        `;
        
        item.addEventListener('click', () => buyUpgrade(key));
        shop.appendChild(item);
    });
}

// Buy upgrade
function buyUpgrade(key) {
    const upgrade = UPGRADES[key];
    const owned = gameState.upgrades[key] || 0;
    const price = upgrade.basePrice * Math.pow(upgrade.priceIncrease, owned);
    
    if (gameState.balance >= price) {
        gameState.balance -= price;
        gameState.upgrades[key] = owned + 1;
        gameState.perClick += upgrade.effect;
        updateDisplay();
        renderUpgrades();
        saveGame();
    }
}

// Render workers shop
function renderWorkers() {
    const shop = document.getElementById('workersShop');
    shop.innerHTML = '';
    
    Object.entries(WORKERS).forEach(([key, worker]) => {
        const owned = gameState.workers[key] || 0;
        const price = worker.basePrice * Math.pow(worker.priceIncrease, owned);
        const affordable = gameState.balance >= price;
        
        const item = document.createElement('div');
        item.className = `shop-item ${affordable ? 'affordable' : ''}`;
        item.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${worker.name}</div>
                <div class="shop-item-desc">${worker.description}</div>
                <div class="shop-item-owned">Owned: ${owned}</div>
            </div>
            <button class="shop-item-button ${affordable ? 'affordable' : 'unaffordable'}">
                $${formatNumber(price)}
            </button>
        `;
        
        item.addEventListener('click', () => buyWorker(key));
        shop.appendChild(item);
    });
}

// Buy worker
function buyWorker(key) {
    const worker = WORKERS[key];
    const owned = gameState.workers[key] || 0;
    const price = worker.basePrice * Math.pow(worker.priceIncrease, owned);
    
    if (gameState.balance >= price) {
        gameState.balance -= price;
        gameState.workers[key] = owned + 1;
        gameState.perSecond += worker.perSecond;
        updateDisplay();
        renderWorkers();
        saveGame();
    }
}

// Render cosmetics shop
function renderCosmetics() {
    const shop = document.getElementById('cosmeticsShop');
    shop.innerHTML = '';
    
    Object.entries(COSMETICS).forEach(([key, cosmetic]) => {
        const owned = gameState.cosmetics[key] || false;
        const affordable = gameState.balance >= cosmetic.price;
        
        const item = document.createElement('div');
        item.className = `cosmetic-item ${owned ? 'owned' : ''}`;
        item.innerHTML = `
            <div class="cosmetic-emoji">${cosmetic.emoji}</div>
            <div class="cosmetic-name">${cosmetic.name}</div>
            ${owned ? '<div class="cosmetic-owned-badge">✓ Owned</div>' : `<div class="cosmetic-price">$${cosmetic.price}</div>`}
        `;
        
        if (!owned) {
            item.addEventListener('click', () => buyCosmetic(key));
        }
        
        shop.appendChild(item);
    });
}

// Buy cosmetic
function buyCosmetic(key) {
    const cosmetic = COSMETICS[key];
    
    if (gameState.balance >= cosmetic.price && !gameState.cosmetics[key]) {
        gameState.balance -= cosmetic.price;
        gameState.cosmetics[key] = true;
        updateDisplay();
        renderCosmetics();
        saveGame();
    }
}

// Save game
function saveGame() {
    localStorage.setItem('cashClickerSave', JSON.stringify(gameState));
}

// Load game
function loadGame() {
    const save = localStorage.getItem('cashClickerSave');
    if (save) {
        Object.assign(gameState, JSON.parse(save));
    }
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
        Object.assign(gameState, {
            balance: 0,
            totalEarned: 0,
            perClick: 1,
            perSecond: 0,
            upgrades: {},
            workers: {},
            cosmetics: {},
            selectedTheme: 'default'
        });
        saveGame();
        location.reload();
    }
}

// Export game
function exportGame() {
    const data = JSON.stringify(gameState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashclicker-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import game
function importGame(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            Object.assign(gameState, imported);
            saveGame();
            renderUpgrades();
            renderWorkers();
            renderCosmetics();
            updateDisplay();
            alert('Game imported successfully!');
        } catch (error) {
            alert('Invalid save file!');
        }
    };
    reader.readAsText(file);
}

// Start the game
window.addEventListener('load', initGame);
