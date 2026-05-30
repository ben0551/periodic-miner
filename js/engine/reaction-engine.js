// ============================================================
// PERIODIC MINER — Reaction Engine
// ============================================================
// Checks REACTIONS once per second. When all reagents for an
// unfired reaction are met, it fires: consuming the reagents,
// granting Protons, and applying a permanent production boost.
//
// permaBoosts are stored here and consulted by UpgradeEngine
// .productionMultiplier() so they stack with upgrade effects.
// ============================================================

const ReactionEngine = {
  _fired:        new Set(),   // IDs of reactions that have fired
  _permaBoosts:  [],          // accumulated { type, factor, ... }
  _newlyFired:   [],          // drained by UI for toasts
  _checkTimer:   0,

  init() {
    this._fired.clear();
    this._permaBoosts  = [];
    this._newlyFired   = [];
    this._checkTimer   = 0;
  },

  tick(deltaSeconds) {
    this._checkTimer += deltaSeconds;
    if (this._checkTimer < 1.0) return;
    this._checkTimer = 0;
    this._checkAll();
  },

  _checkAll() {
    for (const rx of REACTIONS) {
      if (this._fired.has(rx.id)) continue;
      if (!this._canFire(rx)) continue;
      this._fire(rx);
    }
  },

  _canFire(rx) {
    return rx.reagents.every(r => {
      const s = ResourceEngine.state[r.atomicNumber];
      return s && s.unlocked && s.amount >= r.amount;
    });
  },

  _fire(rx) {
    rx.reagents.forEach(r => {
      ResourceEngine.state[r.atomicNumber].amount -= r.amount;
    });
    UpgradeEngine.protons += rx.protonReward;
    if (rx.permaBoost) this._permaBoosts.push(rx.permaBoost);
    this._fired.add(rx.id);
    this._newlyFired.push(rx.id);
  },

  // Called by UpgradeEngine.productionMultiplier to stack reaction bonuses
  productionMultiplier(atomicNumber) {
    if (this._permaBoosts.length === 0) return 1;
    const el = ELEMENT_BY_NUMBER[atomicNumber];
    let m = 1;
    for (const b of this._permaBoosts) {
      if      (b.type === 'all')                             m *= b.factor;
      else if (b.type === 'element'  && b.atomicNumber === atomicNumber) m *= b.factor;
      else if (b.type === 'period'   && el.period    === b.period)       m *= b.factor;
      else if (b.type === 'category' && el.category  === b.category)     m *= b.factor;
    }
    return m;
  },

  serialize() {
    return { fired: [...this._fired], permaBoosts: this._permaBoosts };
  },

  deserialize(saved) {
    this._fired       = new Set(saved.fired ?? []);
    this._permaBoosts = saved.permaBoosts ?? [];
    this._newlyFired  = [];
    this._checkTimer  = 0;
  },
};
