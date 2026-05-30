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

  // Only elements in periods 1..maxUnlockedPeriod can unlock.
  // Starts at 1; increments each time the player does a Nobel Prize Reset.
  maxUnlockedPeriod: 1,

  // Atomic numbers unlocked since the last UI read — drained by UI.update()
  _newlyUnlocked: [],

  // Groups (columns) with all elements unlocked — grants permanent ×1.2 multiplier
  _completedGroups: new Set(),

  init() {
    this.maxUnlockedPeriod = 1;
    ELEMENTS_SORTED.forEach(el => {
      this.state[el.atomicNumber] = {
        amount:   0,
        drills:   0,
        unlocked: el.atomicNumber === 1,
      };
    });
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
        UpgradeEngine.protons += el.period * 0.15 * s.drills * nobleM * deltaSeconds;
      }
    });

    // Radioactive decay: heavy elements transmute into lighter ones
    this._applyRadioactiveDecay(deltaSeconds);

    this._checkUnlocks();
    ReactionEngine.tick(deltaSeconds);
  },

  _applyRadioactiveDecay(deltaSeconds) {
    // Decay chains: heavy elements slowly transmute into lighter ones
    const decayChains = {
      84: { target: 82, rate: 0.0001 }, // Po → Pb
      85: { target: 83, rate: 0.00008 }, // At → Bi
      86: { target: 84, rate: 0.00006 }, // Rn → Po
      87: { target: 85, rate: 0.00005 }, // Fr → At
      88: { target: 86, rate: 0.000045 }, // Ra → Rn
      89: { target: 87, rate: 0.00004 }, // Ac → Fr
      90: { target: 88, rate: 0.000035 }, // Th → Ra
      91: { target: 89, rate: 0.00003 }, // Pa → Ac
      92: { target: 90, rate: 0.000025 }, // U → Th
      93: { target: 91, rate: 0.00002 }, // Np → Pa
      94: { target: 92, rate: 0.000015 }, // Pu → U
      95: { target: 93, rate: 0.00001 }, // Am → Np
      96: { target: 94, rate: 0.000008 }, // Cm → Pu
    };

    for (const [atomicStr, decay] of Object.entries(decayChains)) {
      const atomic = parseInt(atomicStr, 10);
      const s = this.state[atomic];
      const target = this.state[decay.target];

      if (s && s.unlocked && s.amount > 0) {
        const decayed = s.amount * decay.rate * deltaSeconds;
        s.amount -= decayed;
        if (target && target.unlocked) {
          target.amount += decayed;
        }
      }
    }
  },

  // ── Check whether new elements should be auto-revealed ─
  // Elements are only accessible once their period is unlocked via Nobel Prize Reset.
  _checkUnlocks() {
    ELEMENTS_SORTED.forEach(el => {
      if (el.atomicNumber === 1) return;
      if (el.period > this.maxUnlockedPeriod) return; // period gate
      const s = this.state[el.atomicNumber];
      if (s.unlocked) return;

      const prev = this.state[el.atomicNumber - 1];
      if (prev && prev.unlocked && prev.amount >= el.unlockCost) {
        s.unlocked = true;
        this._newlyUnlocked.push(el.atomicNumber);
        this._checkGroupCompletion(el.group);
        this._checkRareEarthDiscovery(el.atomicNumber);
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

  // ── Group Bonuses ─────────────────────────────────────
  _checkGroupCompletion(group) {
    // Skip if group is null (lanthanides/actinides) or already completed
    if (group === null || this._completedGroups.has(group)) return;

    // Check if all elements in this group are unlocked
    const groupElements = ELEMENTS_SORTED.filter(el => el.group === group && el.period <= this.maxUnlockedPeriod);
    const allUnlocked = groupElements.length > 0 && groupElements.every(el => this.state[el.atomicNumber]?.unlocked);

    if (allUnlocked) {
      this._completedGroups.add(group);
    }
  },

  // ── Rare Earth Discovery (auto-fire on first lanthanide) ────
  _checkRareEarthDiscovery(atomicNumber) {
    if (atomicNumber < 57 || atomicNumber > 71) return; // Not a lanthanide
    const rxId = 'rare-earth-discovery';
    if (ReactionEngine._fired.has(rxId)) return; // Already fired

    // Check if this is the first lanthanide unlocked
    const anyLanthanideUnlocked = ELEMENTS_SORTED.some(el => el.atomicNumber >= 57 && el.atomicNumber <= 71 && this.state[el.atomicNumber]?.unlocked);
    if (anyLanthanideUnlocked) {
      ReactionEngine.fire(rxId);
    }
  },

  getGroupBonus() {
    // ×1.2 for each completed group
    return Math.pow(1.2, this._completedGroups.size);
  },

  // ── Serialization ─────────────────────────────────────
  serialize() {
    return {
      state: JSON.parse(JSON.stringify(this.state)),
      maxUnlockedPeriod: this.maxUnlockedPeriod,
      completedGroups: Array.from(this._completedGroups),
    };
  },

  deserialize(saved, elapsedSeconds) {
    if (saved.state) {
      Object.assign(this.state, saved.state);
      this.maxUnlockedPeriod = saved.maxUnlockedPeriod ?? this._inferMaxPeriod();
      this._completedGroups = new Set(saved.completedGroups ?? []);
    } else {
      // Legacy save (flat state object) — migrate
      Object.assign(this.state, saved);
      this.maxUnlockedPeriod = this._inferMaxPeriod();
      this._completedGroups = new Set();
    }
    const clamped = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS);
    if (clamped > 0) this.tick(clamped);
  },

  // For save migration: detect the highest period that had elements unlocked.
  _inferMaxPeriod() {
    let maxP = 1;
    ELEMENTS_SORTED.forEach(el => {
      const s = this.state[el.atomicNumber];
      if (s && s.unlocked && el.period > maxP) maxP = el.period;
    });
    return maxP;
  },

  // ── Nobel Prize Prestige reset ─────────────────────────
  // Resets ONLY the current period's elements.
  // Earlier periods keep running — you don't lose them.
  // Increments maxUnlockedPeriod so the next period becomes accessible.
  prestigeReset(period) {
    ELEMENTS_SORTED.forEach(el => {
      if (el.period === period) {
        const s = this.state[el.atomicNumber];
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
    this.maxUnlockedPeriod = period + 1;
    UpgradeEngine.onPrestige(period);
  },
};
