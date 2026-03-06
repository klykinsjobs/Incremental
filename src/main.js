import { GameEngine } from "./GameEngine.js";

const engine = new GameEngine();

let speed = 1;
let lastTick = performance.now();

const goldLabel = document.getElementById("gold-label");
const goldProgressFill = document.getElementById("gold-progress-fill");
const goldProgress = document.getElementById("goal-label");
const platinumLabel = document.getElementById("platinum-label");

function updateUI() {
    goldLabel.textContent = `Gold: ${Math.floor(engine.gold)}`;
    platinumLabel.textContent = `Platinum: ${engine.platinum}`;

    const pct = Math.min((engine.gold / engine.goal) * 100, 100);
    goldProgress.textContent = `${pct.toFixed(2)}% to goal`;
    goldProgressFill.style.width = pct + "%";

    // Update generator panels
    for (const [type, g] of Object.entries(engine.generators)) {
        document.getElementById(`${type}-count-label`).textContent = `Owned: ${g.count}`;
        document.getElementById(`${type}-rate-label`).textContent = `Rate: ${g.rate}`;

        const buyBtn = document.getElementById(`${type}-buy-button`);
        buyBtn.textContent = `Buy (${g.cost} gold)`;
        buyBtn.disabled = engine.gold < g.cost || engine.gameWon;

        const upgradeBtn = document.getElementById(`${type}-upgrade-button`);
        upgradeBtn.textContent = `Upgrade (${g.upgradeCost} platinum)`;
        upgradeBtn.disabled = engine.platinum < g.upgradeCost || engine.gameWon;
    }
}

// Win modal
function showWinModal() {
    const modal = document.getElementById("win-modal");
    modal.classList.remove("hidden");

    document.getElementById("restart-button").onclick = () => {
        location.reload();
    };
}

function spawnFloatText(text, type, anchorElement) {
    const el = document.createElement("div");
    el.className = `float-text float-${type}`;
    el.textContent = text;

    const rect = anchorElement.getBoundingClientRect();
    el.style.left = rect.left + rect.width / 2 + "px";
    el.style.top = rect.top - 20 + "px";

    document.getElementById("float-container").appendChild(el);

    setTimeout(() => el.remove(), 1000);
}

// Main loop
function gameLoop(now) {
    const delta = now - lastTick;

    if (delta >= 1000 / speed) {
        lastTick = now;

        const events = engine.tick();
        events.forEach(e => {
            if (e.type === "gold") {
                spawnFloatText(`+${Math.floor(e.amount)}`, "gold", goldLabel);
            }
            if (e.type === "platinum") {
                spawnFloatText(`+${e.amount}`, "platinum", platinumLabel);
            }
        });

        updateUI();
    }

    requestAnimationFrame(gameLoop);
}

// Event listeners
document.querySelectorAll("[data-buy]").forEach(btn => {
    btn.addEventListener("click", () => {
        engine.buy(btn.dataset.buy);
        updateUI();
    });
});

document.querySelectorAll("[data-upgrade]").forEach(btn => {
    btn.addEventListener("click", () => {
        engine.upgrade(btn.dataset.upgrade);
        updateUI();
    });
});

document.querySelectorAll("[data-speed]").forEach(btn => {
    btn.addEventListener("click", () => {
        speed = Number(btn.dataset.speed);

        document.querySelectorAll("[data-speed]").forEach(b =>
            b.classList.remove("speed-active")
        );

        btn.classList.add("speed-active");
    });
});

// Win notification
engine.onGameWon = () => {
    updateUI();
    showWinModal();
};

// Start game
updateUI();
requestAnimationFrame(gameLoop);
