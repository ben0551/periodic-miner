// ============================================================
// PERIODIC(TABLE) MINER — Entry Point
// ============================================================
// Boots the game after the DOM is ready.
// Load order (see index.html):
//   data/elements.js → engine/resources.js → engine/upgrades.js
//   → engine/game.js → ui/table.js → ui/ui.js → main.js

document.addEventListener('DOMContentLoaded', () => {
  GameLoop.init();
  GameLoop.start();

  // Expose debug helpers on window in development
  if (location.hostname === 'localhost' || location.protocol === 'file:') {
    window.Game    = GameLoop;
    window.Res     = ResourceEngine;
    window.Upg     = UpgradeEngine;
    // e.g. Game.wipe()           — clear save
    // e.g. Res.state[1].amount   — inspect H stockpile
    // e.g. Upg.protons += 9999   — cheat protons
  }
});
