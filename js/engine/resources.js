// ============================================================
// PERIODIC(TABLE) MINER — Resource Engine
// ============================================================
// DESIGN:
//   Each element N has:
//     amount     — current stockpile (fractional, display rounded)
//     drills     — number of auto-miners owned
//     unlocked   — whether the player can interact with it
//
//   Per tick, each element with drills > 0 produces:
//     production = drills * element.baseRate * upgradeMultiplier(N)
//
//   The "chain" mechanic (like AdVenture Communist) works like this:
//     - Drills for element N are BOUGHT using element N-1 stock
//     - Unlocking element N requires element N-1 stock >= unlockCost
//     - Noble gases (group 18) are a special "Proton" currency used
//       for research upgrades (converted at a rate based on period)
//
//   Offline progress:
//     On load, compute elapsed seconds since last save and
//     apply production as if the game ran for that time.
//     Cap offline time at MAX_OFFLINE_SECONDS to avoid absurd gains.
//
//   TODO: Offline production calculation in game.js restoreFromSave()
// ============================================================

const MAX_OFFLINE_SECONDS = 60 * 60 * 8; // 8 hours

// H drills are bought with He (no element 0 exists); all others use N-1.
function drillPayerNumber(atomicNumber) {
  return atomicNumber === 1 ? 2 : atomicNumber - 1;
}

// Runtime state — one entry per element.
// Initialized in ResourceEngine.init(), saved/loaded via game.js.
const ResourceEngine = {
  // state[atomicNumber] = { amount, drills, unlocked }
  state: {},

  // Atomic numbers unlocked since the last UI read — drained by UI.update()
  _newlyUnlocked: [],

  init() {
    ELEMENTS_SORTED.forEach(el => {
      this.state[el.atomicNumber] = {
        amount:   0,
        drills:   0,
        unlocked: el.atomicNumber === 1, // only H starts unlocked
      };
    });
    // Player starts with a few hydrogen drills so the game moves immediately
    this.state[1].drills = 1;
  },

  // ── Core tick ─────────────────────────────────────────
  // deltaSeconds: time elapsed since last tick (from game.js)
  tick(deltaSeconds) {
    ELEMENTS_SORTED.forEach(el => {
      const s = this.state[el.atomicNumber];
      if (!s.unlocked || s.drills === 0) return;

      const multiplier = UpgradeEngine.productionMultiplier(el.atomicNumber);
      s.amount += el.baseRate * s.drills * multiplier * deltaSeconds;

      if (el.group === 18) {
        const nobleM = UpgradeEngine.nobleGasProtonMultiplier(el.atomicNumber);
        UpgradeEngine.protons += el.period * 0.5 * s.drills * nobleM * deltaSeconds;
      }
    });

    this._checkUnlocks();
  },

  // ── Check whether new elements should be auto-revealed ─
  _checkUnlocks() {
    ELEMENTS_SORTED.forEach(el => {
      if (el.atomicNumber === 1) return;
      const s = this.state[el.atomicNumber];
      if (s.unlocked) return;

      const prev = this.state[el.atomicNumber - 1];
      if (prev && prev.unlocked && prev.amount >= el.unlockCost) {
        s.unlocked = true;
        this._newlyUnlocked.push(el.atomicNumber);
      }
    });
  },

  // ── Buy drills for element N ───────────────────────────
  // H drills are paid in He; all others paid in element N-1.
  // Returns true on success, false if insufficient funds.
  buyDrill(atomicNumber, quantity = 1) {
    const payerNum = drillPayerNumber(atomicNumber);
    const el    = ELEMENT_BY_NUMBER[atomicNumber];
    const s     = this.state[atomicNumber];
    const payer = this.state[payerNum];
    if (!s || !payer || !s.unlocked || !payer.unlocked) return false;

    const cost = this.drillCost(atomicNumber, quantity);
    if (payer.amount < cost) return false;

    payer.amount -= cost;
    s.drills     += quantity;
    return true;
  },

  // Cost to buy `quantity` drills starting from current drillCount.
  // Each drill costs ceil(drillCostBase * 1.15^(existingDrills+i) * discount).
  // Ceiling keeps costs as integers so the displayed value always matches the check.
  drillCost(atomicNumber, quantity = 1) {
    const el       = ELEMENT_BY_NUMBER[atomicNumber];
    const s        = this.state[atomicNumber];
    const discount = UpgradeEngine.drillCostMultiplier();
    let total = 0;
    for (let i = 0; i < quantity; i++) {
      total += Math.ceil(el.drillCostBase * Math.pow(1.15, s.drills + i) * discount);
    }
    return total;
  },

  // ── Manual mining: click action for element 1 (H) ────
  // TODO: expand to allow manual mining of any unlocked element
  //       (diminishing returns vs. drills)
  manualMine(atomicNumber) {
    const s = this.state[atomicNumber];
    if (!s || !s.unlocked) return;
    const multiplier = UpgradeEngine.productionMultiplier(atomicNumber);
    s.amount += ELEMENT_BY_NUMBER[atomicNumber].baseRate * multiplier;
  },

  // ── Proton currency (noble gas conversion) ────────────
  // TODO: When a noble gas accumulates to a threshold, convert
  //       stockpile to Protons at a period-based exchange rate.
  //       Protons are NOT reset on Nobel Prize prestige.
  convertNobleGasToProtons(atomicNumber) {
    // placeholder
  },

  // ── Serialization ─────────────────────────────────────
  serialize() {
    return JSON.parse(JSON.stringify(this.state));
  },

  deserialize(saved, elapsedSeconds) {
    Object.assign(this.state, saved);
    const clamped = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS);
    if (clamped > 0) this.tick(clamped);
  },

  // ── Nobel Prize Prestige reset ─────────────────────────
  // Resets element stockpiles and drills up to and including
  // maxPeriod, but does NOT reset Protons or purchased upgrades.
  // Grants a permanent production multiplier bonus.
  prestigeReset(maxPeriod) {
    ELEMENTS_SORTED.forEach(el => {
      if (el.period <= maxPeriod) {
        const s = this.state[el.atomicNumber];
        s.amount  = 0;
        s.drills  = el.atomicNumber === 1 ? 1 : 0;
        s.unlocked = el.atomicNumber === 1;
      }
    });
    UpgradeEngine.onPrestige(maxPeriod);
  },
};
