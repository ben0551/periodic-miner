// ============================================================
// PERIODIC MINER — Entry Point
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme before game init to prevent flash
  if (localStorage.getItem('periodic-miner-theme') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('btn-theme').textContent = '🌙';
  }

  document.getElementById('btn-theme').addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    document.getElementById('btn-theme').textContent = isLight ? '🌙' : '☀';
    localStorage.setItem('periodic-miner-theme', isLight ? 'light' : 'dark');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Reset ALL progress?\n\nThis permanently wipes your save — elements, upgrades, reactions, Protons. There is no undo.')) {
      GameLoop.wipe();
    }
  });

  GameLoop.init();
  GameLoop.start();

  // Debug helpers (localhost / file://)
  if (location.hostname === 'localhost' || location.protocol === 'file:') {
    window.Game = GameLoop;
    window.Res  = ResourceEngine;
    window.Upg  = UpgradeEngine;
    window.Rx   = ReactionEngine;
    // Game.wipe() — clear save and reload
    // Upg.protons += 9999 — cheat protons
    // Res.maxUnlockedPeriod = 3 — unlock periods
  }
});
