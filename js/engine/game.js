// ============================================================
// PERIODIC MINER — Core Game Loop
// ============================================================
// DESIGN:
//   GameLoop drives the idle tick using requestAnimationFrame.
//   It calls ResourceEngine.tick(delta) ~60fps, but UI updates
//   are throttled to UI_UPDATE_HZ to avoid DOM thrashing.
//
//   Save/Load:
//     Auto-saves every AUTO_SAVE_INTERVAL_MS to localStorage.
//     On load, computes offline time and forwards it to
//     ResourceEngine.deserialize() for offline production.
//
//   Game phases:
//     1. init()      — wire up engines, render initial UI
//     2. start()     — kick off rAF loop
//     3. pause()     — stop rAF (for modal/focus loss)
//     4. resume()    — restart rAF
//
//   Prestige (Nobel Prize Reset):
//     Available when the player has fully unlocked any complete
//     period. Calls ResourceEngine.prestigeReset(period) and
//     UpgradeEngine.onPrestige(period), then re-renders.
//
//   TODO: "offline notification" modal on first tick after load
//   TODO: Tab visibility API — pause when hidden, apply offline on return
// ============================================================

const SAVE_KEY              = 'periodic-miner-save-v1';
const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds
const UI_UPDATE_HZ          = 20;     // DOM updates per second
const UI_UPDATE_INTERVAL_MS = 1000 / UI_UPDATE_HZ;

const GameLoop = {
  _rafId:          null,
  _lastTime:       0,
  _uiAccumulator:  0,
  _saveAccumulator: 0,
  running:         false,

  // ── Initialise all subsystems ─────────────────────────
  init() {
    ResourceEngine.init();
    UpgradeEngine.init();
    ReactionEngine.init();

    const saved = this._loadRaw();
    if (saved) {
      this._restoreFromSave(saved);
    }

    TableUI.render();
    UI.render();
    FeaturesUI.init();

    // Wire up features panel toggle
    document.getElementById('toggle-features').addEventListener('click', () => {
      const panel = document.getElementById('panel-features');
      panel.classList.toggle('features-hidden');
    });

    // Auto-saves every 30s — manual save removed; Reset button handled in main.js
    document.getElementById('btn-prestige').addEventListener('click', () => this._handlePrestige());
    document.getElementById('btn-proton-prestige').addEventListener('click', () => this._handleProtonPrestige());
    document.getElementById('modal-close').addEventListener('click', () => UI.closeModal());
    // Close modal when clicking the dark backdrop (not the card itself)
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) UI.closeModal();
    });
  },

  // ── Main loop ─────────────────────────────────────────
  start() {
    this.running  = true;
    this._lastTime = performance.now();
    this._tick(this._lastTime);
  },

  pause() {
    this.running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  },

  resume() {
    if (this.running) return;
    this._lastTime = performance.now();
    this.running = true;
    this._tick(this._lastTime);
  },

  _tick(now) {
    const delta          = (now - this._lastTime) / 1000; // seconds
    this._lastTime       = now;
    this._uiAccumulator += delta;
    this._saveAccumulator += delta * 1000;

    ResourceEngine.tick(delta);

    if (this._uiAccumulator >= 1 / UI_UPDATE_HZ) {
      UI.update();
      TableUI.updateProduction();
      this._uiAccumulator = 0;
    }

    if (this._saveAccumulator >= AUTO_SAVE_INTERVAL_MS) {
      this.save();
      this._saveAccumulator = 0;
    }

    if (this.running) {
      this._rafId = requestAnimationFrame(t => this._tick(t));
    }
  },

  // ── Prestige ──────────────────────────────────────────
  _handlePrestige() {
    const period = this._prestigeReadyPeriod();
    if (!period) return;

    const bonus  = 1.0 + period * 0.5;
    const next   = period + 1;
    const confirmed = confirm(
      `Nobel Prize Reset — Period ${period}\n\n` +
      `Reset all Period ${period} elements and receive a permanent ×${bonus.toFixed(1)} production multiplier?\n\n` +
      `This unlocks Period ${next}. Your Protons and purchased upgrades are kept.\n\n` +
      `Earlier periods keep running — you only lose Period ${period} stockpiles.`
    );
    if (!confirmed) return;

    ResourceEngine.prestigeReset(period);
    TableUI.render();
    UI.render();
    this._updatePrestigeButton();
  },

  // Returns the current period if ALL its elements are unlocked, else null.
  // Only the active period (maxUnlockedPeriod) is eligible — not earlier ones.
  _prestigeReadyPeriod() {
    const p = ResourceEngine.maxUnlockedPeriod;
    const periodElements = ELEMENTS_SORTED.filter(el => el.period === p);
    const allUnlocked = periodElements.every(
      el => ResourceEngine.state[el.atomicNumber]?.unlocked
    );
    return allUnlocked ? p : null;
  },

  _handleProtonPrestige() {
    const cost = 750000;
    if (UpgradeEngine.protons < cost) return;

    const period = ResourceEngine.maxUnlockedPeriod;
    const bonus = 1.3; // ×1.3 multiplier

    const confirmed = confirm(
      `Proton Prestige — Period ${period}\n\n` +
      `Cost: ${cost.toLocaleString()} Protons\n\n` +
      `Reset all Period ${period} elements and receive a permanent ×${bonus} production multiplier?\n\n` +
      `Your Protons and purchased upgrades are kept.\n\n` +
      `Earlier periods keep running — you only lose Period ${period} stockpiles.`
    );
    if (!confirmed) return;

    UpgradeEngine.protons -= cost;
    UpgradeEngine.prestigeMultiplier *= bonus;

    // Reset only the current period
    ELEMENTS_SORTED.forEach(el => {
      if (el.period === period) {
        const s = ResourceEngine.state[el.atomicNumber];
        s.amount = 0;
        if (el.atomicNumber === 1) {
          s.drills = 1;
          s.unlocked = true;
        } else {
          s.drills = 0;
          s.unlocked = false;
        }
      }
    });

    TableUI.render();
    UI.render();
    this._updatePrestigeButton();
  },

  _updatePrestigeButton() {
    const btn    = document.getElementById('btn-prestige');
    const btnProton = document.getElementById('btn-proton-prestige');
    const period = this._prestigeReadyPeriod();
    const next   = ResourceEngine.maxUnlockedPeriod;

    // Nobel Reset button
    btn.disabled = !period;
    if (period) {
      const bonus = (1.0 + period * 0.5).toFixed(1);
      btn.textContent = `Nobel Reset P${period} → ×${bonus} + Unlock P${period + 1}`;
    } else {
      btn.textContent = `Nobel Reset (complete Period ${next} first)`;
    }

    // Proton Prestige button (always available if you have 750k protons)
    const cost = 750000;
    const canAfford = UpgradeEngine.protons >= cost;
    btnProton.disabled = !canAfford;
    btnProton.textContent = canAfford
      ? `⚡ Prestige`
      : `⚡ Need more`;
  },

  // ── Save / Load ───────────────────────────────────────
  save() {
    // Defer save to avoid blocking game loop
    setTimeout(() => {
      const payload = {
        version:    2,
        savedAt:    Date.now(),
        resources:  ResourceEngine.serialize(),
        upgrades:   UpgradeEngine.serialize(),
        reactions:  ReactionEngine.serialize(),
        features:   FeaturesUI.serialize(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    }, 0);
  },

  _loadRaw() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  _restoreFromSave(saved) {
    const elapsedMs = Date.now() - (saved.savedAt ?? Date.now());
    const elapsedS  = elapsedMs / 1000;

    UpgradeEngine.deserialize(saved.upgrades ?? {});
    ReactionEngine.deserialize(saved.reactions ?? {});
    ResourceEngine.deserialize(saved.resources ?? {}, elapsedS);
    FeaturesUI.deserialize(saved.features ?? {});
  },

  // Wipe save and reload (for debug / "new game")
  wipe() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  },
};
