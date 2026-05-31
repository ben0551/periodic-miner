// ============================================================
// PERIODIC MINER — Feature Panel UI
// ============================================================
// Four tabs: Quiz | Shells | Trends | Timeline
// Renders below the periodic table element info strip.
// ============================================================

const FeaturesUI = {
  _activeFeature: 'quiz',
  _quizState: {
    streak: 0,
    maxStreak: 0,
    mode: 'symbol-to-name', // or 'name-to-symbol' or 'reaction-guess'
    current: null,
  },
  _historyCenturies: {},

  // ── Initialization ─────────────────────────────────────
  init() {
    const tabs = document.querySelectorAll('.feat-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._activeFeature = e.currentTarget.dataset.feat;
        tabs.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.render();
      });
    });

    const toggleBtn = document.getElementById('toggle-features');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const panel = document.getElementById('panel-features');
        panel.classList.toggle('features-hidden');
      });
    }

    this._buildHistoryCenturies();
    this.render();
  },

  _buildHistoryCenturies() {
    this._historyCenturies = {
      'Prehistoric': [],
      '1600s': [],
      '1700s': [],
      '1800s': [],
      '1900s': [],
      '2000s': [],
    };
    for (let i = 1; i <= 118; i++) {
      const props = ELEMENT_PROPS[i];
      if (!props.discoveryYear) {
        this._historyCenturies['Prehistoric'].push(i);
      } else if (props.discoveryYear < 1700) {
        this._historyCenturies['1600s'].push(i);
      } else if (props.discoveryYear < 1800) {
        this._historyCenturies['1700s'].push(i);
      } else if (props.discoveryYear < 1900) {
        this._historyCenturies['1800s'].push(i);
      } else if (props.discoveryYear < 2000) {
        this._historyCenturies['1900s'].push(i);
      } else {
        this._historyCenturies['2000s'].push(i);
      }
    }
  },

  // ── Main render ────────────────────────────────────────
  render() {
    const content = document.getElementById('feature-content');
    content.innerHTML = '';

    switch (this._activeFeature) {
      case 'quiz': this._renderQuiz(); break;
      case 'shells': this._renderShells(1); break; // default to H
      case 'timeline': this._renderTimeline(); break;
    }
  },

  // ── Quiz ───────────────────────────────────────────────
  _renderQuiz() {
    const unlockedNumbers = ELEMENTS_SORTED
      .filter(el => ResourceEngine.state[el.atomicNumber]?.unlocked)
      .map(el => el.atomicNumber);

    const firedReactions = REACTIONS.filter(rx => ReactionEngine._fired.has(rx.id));

    if (unlockedNumbers.length === 0 && firedReactions.length === 0) {
      document.getElementById('feature-content').innerHTML =
        '<p class="text-muted" style="padding:1rem">Unlock elements or trigger reactions to take the quiz.</p>';
      return;
    }

    // Randomly pick between element quiz or reaction quiz
    const useReactionQuiz = firedReactions.length > 0 && Math.random() > 0.6;

    if (useReactionQuiz) {
      this._renderQuizReaction(firedReactions);
    } else {
      this._renderQuizElement(unlockedNumbers);
    }
  },

  _renderQuizElement(unlockedNumbers) {
    // Always pick a new random unlocked element
    this._quizState.current = unlockedNumbers[Math.floor(Math.random() * unlockedNumbers.length)];

    const el = ELEMENT_BY_NUMBER[this._quizState.current];
    const isSymbolMode = Math.random() > 0.5;

    // Generate wrong answers (increases with streak: +1 for every 10-streak, max 5 wrong)
    const numWrongAnswers = Math.min(5, 2 + Math.floor(this._quizState.streak / 10));
    const otherNumbers = unlockedNumbers.filter(n => n !== this._quizState.current);
    const wrongAnswers = otherNumbers
      .sort(() => Math.random() - 0.5)
      .slice(0, numWrongAnswers)
      .map(n => ELEMENT_BY_NUMBER[n]);

    const correctAnswer = isSymbolMode ? el.name : el.symbol;
    const options = [correctAnswer, ...wrongAnswers.map(w => isSymbolMode ? w.name : w.symbol)]
      .sort(() => Math.random() - 0.5);

    const content = document.getElementById('feature-content');
    const html = `
      <div class="quiz-container">
        <div class="quiz-question">
          ${isSymbolMode ? `<div class="quiz-symbol">${el.symbol}</div>` : `<div class="quiz-name">${el.name}</div>`}
          <div class="quiz-prompt">${isSymbolMode ? 'Name?' : 'Symbol?'}</div>
        </div>
        <div class="quiz-streak">Streak: ${this._quizState.streak} (Best: ${this._quizState.maxStreak})</div>
        <div class="quiz-options">
          ${options.map((opt, idx) => `
            <button class="quiz-btn" data-correct="${opt === correctAnswer}">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    content.innerHTML = html;

    content.querySelectorAll('.quiz-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isCorrect = e.currentTarget.dataset.correct === 'true';
        if (isCorrect) {
          this._quizState.streak++;
          UpgradeEngine.protons += 2;
          // Award bonus protons for new personal record
          if (this._quizState.streak > this._quizState.maxStreak) {
            this._quizState.maxStreak = this._quizState.streak;
            UpgradeEngine.protons += 5;
          }
          // Award milestone bonus at every 10-streak
          if (this._quizState.streak % 10 === 0) {
            const periodMultiplier = Math.pow(1.5, ResourceEngine.maxUnlockedPeriod);
            const bonus = 10000 * periodMultiplier;
            UpgradeEngine.protons += bonus;
            const celebration = ['🎉', '🌟', '✨', '⚡'].join('');
            UI.showToast(`${celebration} STREAK ${this._quizState.streak}! ${celebration}\n+${UI.formatNum(Math.floor(bonus))} PROTONS`, 'success');
          }
          this._renderQuiz();
        } else {
          this._quizState.streak = 0;
          e.currentTarget.style.backgroundColor = 'var(--danger)';
          const message = isSymbolMode
            ? `The correct answer is ${el.name} — ${el.symbol} is the symbol for ${el.name}.`
            : `The correct answer is ${el.symbol} — the symbol for ${el.name}.`;
          UI.showToast(message + '\n\n(Click to continue)');
          // Disable all buttons and wait for click to continue
          content.querySelectorAll('.quiz-btn').forEach(btn => btn.disabled = true);
          content.addEventListener('click', () => this._renderQuiz(), { once: true });
        }
      });
    });
  },

  _renderQuizReaction(firedReactions) {
    const rx = firedReactions[Math.floor(Math.random() * firedReactions.length)];
    this._quizState.current = rx.id;

    // Generate wrong answers (increases with streak: +1 for every 10-streak, max 5 wrong)
    const numWrongAnswers = Math.min(5, 2 + Math.floor(this._quizState.streak / 10));
    const otherReactions = firedReactions.filter(r => r.id !== rx.id);
    const wrongAnswers = otherReactions
      .sort(() => Math.random() - 0.5)
      .slice(0, numWrongAnswers)
      .map(r => r.name);

    const options = [rx.name, ...wrongAnswers]
      .sort(() => Math.random() - 0.5);

    const content = document.getElementById('feature-content');
    const html = `
      <div class="quiz-container">
        <div class="quiz-question">
          <div class="quiz-symbol" style="font-family:var(--font-mono);font-size:1.2rem">${rx.formula}</div>
          <div class="quiz-prompt">Which reaction?</div>
        </div>
        <div class="quiz-streak">Streak: ${this._quizState.streak} (Best: ${this._quizState.maxStreak})</div>
        <div class="quiz-options">
          ${options.map((opt, idx) => `
            <button class="quiz-btn" data-correct="${opt === rx.name}">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    content.innerHTML = html;

    content.querySelectorAll('.quiz-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isCorrect = e.currentTarget.dataset.correct === 'true';
        if (isCorrect) {
          this._quizState.streak++;
          UpgradeEngine.protons += 2;
          // Award bonus protons for new personal record
          if (this._quizState.streak > this._quizState.maxStreak) {
            this._quizState.maxStreak = this._quizState.streak;
            UpgradeEngine.protons += 5;
          }
          // Award milestone bonus at every 10-streak
          if (this._quizState.streak % 10 === 0) {
            const periodMultiplier = Math.pow(1.5, ResourceEngine.maxUnlockedPeriod);
            const bonus = 10000 * periodMultiplier;
            UpgradeEngine.protons += bonus;
            const celebration = ['🎉', '🌟', '✨', '⚡'].join('');
            UI.showToast(`${celebration} STREAK ${this._quizState.streak}! ${celebration}\n+${UI.formatNum(Math.floor(bonus))} PROTONS`, 'success');
          }
          this._renderQuiz();
        } else {
          this._quizState.streak = 0;
          e.currentTarget.style.backgroundColor = 'var(--danger)';
          const message = `The correct answer is ${rx.name} — the formula is ${rx.formula}.`;
          UI.showToast(message + '\n\n(Click to continue)');
          // Disable all buttons and wait for click to continue
          content.querySelectorAll('.quiz-btn').forEach(btn => btn.disabled = true);
          content.addEventListener('click', () => this._renderQuiz(), { once: true });
        }
      });
    });
  },

  // ── Electron Shells ────────────────────────────────────
  _renderShells(atomicNumber) {
    const el = ELEMENT_BY_NUMBER[atomicNumber];
    const s = ResourceEngine.state[atomicNumber];
    const props = ELEMENT_PROPS[atomicNumber];
    const unlocked = s?.unlocked;

    const maxRadius = 150;
    const shells = props.shells;
    const totalShells = shells.length;
    const shellRadius = maxRadius / (totalShells + 1);

    let svg = `<svg viewBox="0 0 300 300" class="shells-svg" style="max-height:150px">
      <circle cx="150" cy="150" r="12" fill="var(--accent)" opacity="${unlocked ? 1 : 0.3}"/>`;

    // Draw shells and electrons
    for (let i = 0; i < totalShells; i++) {
      const radius = shellRadius * (i + 1);
      svg += `<circle cx="150" cy="150" r="${radius}" fill="none" stroke="var(--accent)" stroke-width="1" opacity="${unlocked ? 0.3 : 0.15}"/>`;

      const electronCount = shells[i];
      for (let j = 0; j < electronCount; j++) {
        const angle = (j / electronCount) * Math.PI * 2;
        const x = 150 + radius * Math.cos(angle);
        const y = 150 + radius * Math.sin(angle);
        svg += `<circle cx="${x}" cy="${y}" r="4" fill="var(--accent)" opacity="${unlocked ? 0.8 : 0.3}"/>`;
      }
    }

    svg += `</svg>`;

    const content = document.getElementById('feature-content');
    content.innerHTML = `
      <div class="shells-container">
        <div class="shells-header">${el.symbol} — ${el.name}</div>
        ${svg}
        <div class="shells-config">${shells.join('-')}</div>
        <div class="shells-tip">Hover over elements in the table to see their electron shells</div>
      </div>
    `;
  },

  // Called when hovering over table elements
  updateShellsOnHover(atomicNumber) {
    if (this._activeFeature === 'shells') {
      this._renderShells(atomicNumber);
    }
  },

  // ── Periodic Trends ────────────────────────────────────
  // ── Discovery Timeline ─────────────────────────────────
  _renderTimeline() {
    const content = document.getElementById('feature-content');
    let html = '<div class="timeline-container">';

    const centuries = ['Prehistoric', '1600s', '1700s', '1800s', '1900s', '2000s'];
    for (const century of centuries) {
      const nums = this._historyCenturies[century];
      if (nums.length === 0) continue;

      html += `<div class="timeline-century"><h4>${century}</h4>`;

      nums.forEach(n => {
        const el = ELEMENT_BY_NUMBER[n];
        const s = ResourceEngine.state[n];
        const props = ELEMENT_PROPS[n];
        const unlocked = s?.unlocked;
        const year = props.discoveryYear || 'Unknown';
        const by = props.discoveredBy || 'Ancient';

        const color = unlocked ? 'var(--accent)' : 'var(--muted)';
        html += `<div class="timeline-row" style="color:${color}">
          <span class="tl-year">${year}</span>
          <span class="tl-symbol">${el.symbol}</span>
          <span class="tl-name">${el.name}</span>
          <span class="tl-by">${by}</span>
        </div>`;
      });

      html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;
  },

  // ── Serialization ─────────────────────────────────────
  serialize() {
    return {
      quizState: JSON.parse(JSON.stringify(this._quizState)),
    };
  },

  deserialize(saved) {
    if (saved?.quizState) {
      this._quizState = saved.quizState;
    }
  },
};
