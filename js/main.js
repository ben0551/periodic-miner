// ============================================================
// PERIODIC MINER — Entry Point
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const THEMES = ['dark', 'torch', 'neon', 'ocean', 'forest', 'solar', 'contrast'];
  const savedTheme = localStorage.getItem('periodic-miner-theme') ?? 'dark';

  // Apply saved theme before game init to prevent flash
  function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('light-mode', ...THEMES.map(t => `theme-${t}`));
    if (theme === 'torch') {
      document.body.classList.add('light-mode');
    } else if (theme !== 'dark') {
      document.body.classList.add(`theme-${theme}`);
    }
    document.getElementById('btn-theme').value = theme;
    localStorage.setItem('periodic-miner-theme', theme);
  }

  applyTheme(savedTheme);

  document.getElementById('btn-theme').addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Reset ALL progress?\n\nThis permanently wipes your save — elements, upgrades, reactions, Protons. There is no undo.')) {
      GameLoop.wipe();
    }
  });

  GameLoop.init();
  FeaturesUI.init();
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
