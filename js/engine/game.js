// ============================================================
// PERIODIC(TABLE) MINER — Core Game Loop
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

    const saved = this._loadRaw();
    if (saved) {
      this._restoreFromSave(saved);
    }

    TableUI.render();
    UI.render();

    document.getElementById('btn-save').addEventListener('click', () => this.save());
    document.getElementById('btn-prestige').addEventListener('click', () => this._handlePrestige());
    document.getElementById('modal-close').addEventListener('click', () => UI.closeModal());
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

    const confirmed = confirm(
      `Nobel Prize Reset!\n\nReset all Period ${period} progress for a permanent ${Math.round((UpgradeEngine.prestigeMultiplier - 1) * 100 + 10)}% production bonus?\n\nYour Protons and purchased upgrades are kept.`
    );
    if (!confirmed) return;

    ResourceEngine.prestigeReset(period);
    TableUI.render();
    UI.render();
    this._updatePrestigeButton();
  },

  // Returns the highest complete period eligible for prestige, or null.
  _prestigeReadyPeriod() {
    for (let p = 1; p <= 7; p++) {
      const periodElements = ELEMENTS_SORTED.filter(el => el.period === p);
      const allUnlocked = periodElements.every(
        el => ResourceEngine.state[el.atomicNumber].unlocked
      );
      if (allUnlocked) return p;
    }
    return null;
  },

  _updatePrestigeButton() {
    const btn = document.getElementById('btn-prestige');
    const ready = this._prestigeReadyPeriod();
    btn.disabled = !ready;
    btn.textContent = ready
      ? `Nobel Prize Reset (Period ${ready})`
      : 'Nobel Prize Reset';
  },

  // ── Save / Load ───────────────────────────────────────
  save() {
    const payload = {
      version:    1,
      savedAt:    Date.now(),
      resources:  ResourceEngine.serialize(),
      upgrades:   UpgradeEngine.serialize(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    // Brief visual feedback
    const btn = document.getElementById('btn-save');
    btn.textContent = 'Saved!';
    setTimeout(() => btn.textContent = 'Save', 1000);
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
    ResourceEngine.deserialize(saved.resources ?? {}, elapsedS);
  },

  // Wipe save and reload (for debug / "new game")
  wipe() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  },
};
