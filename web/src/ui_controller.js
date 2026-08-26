/**
 * DREXVIA - UI & HUD Controller
 * Developer: Soumya Chunary Studios
 */

class UIController {
  constructor(gameClient) {
    this.game = gameClient;
    this.currentScreen = 'main_menu'; // 'main_menu', 'lobby', 'game', 'results', 'field_guide', 'profile', 'settings'
    this.bindEvents();
  }

  bindEvents() {
    // Navigation Buttons
    const btnPlayMulti = document.getElementById('btn-play-multiplayer');
    if (btnPlayMulti) btnPlayMulti.addEventListener('click', () => this.startMatchmaking('multiplayer'));

    const btnPlaySolo = document.getElementById('btn-play-solo');
    if (btnPlaySolo) btnPlaySolo.addEventListener('click', () => this.startMatchmaking('solo'));

    const btnPlayHorde = document.getElementById('btn-play-horde');
    if (btnPlayHorde) btnPlayHorde.addEventListener('click', () => this.startMatchmaking('horde'));

    const btnCancelQueue = document.getElementById('btn-cancel-queue');
    if (btnCancelQueue) btnCancelQueue.addEventListener('click', () => this.cancelMatchmaking());

    const btnFieldGuide = document.getElementById('btn-menu-field-guide');
    if (btnFieldGuide) btnFieldGuide.addEventListener('click', () => this.openModal('field-guide-modal'));

    const btnProfile = document.getElementById('btn-menu-profile');
    if (btnProfile) btnProfile.addEventListener('click', () => this.openModal('profile-modal'));

    const btnClans = document.getElementById('btn-menu-clans');
    if (btnClans) btnClans.addEventListener('click', () => {
      this.openModal('clan-modal');
      if (this.game.ws && this.game.ws.readyState === 1) {
        this.game.ws.send(JSON.stringify({ type: 'c_get_clan_leaderboard' }));
      } else {
        // Render offline defaults
        const defaults = (typeof GLOBAL_CLANS !== 'undefined') ? GLOBAL_CLANS : [];
        this.renderClanLeaderboard(defaults);
      }
    });

    const btnSettings = document.getElementById('btn-menu-settings');
    if (btnSettings) btnSettings.addEventListener('click', () => this.openModal('settings-modal'));

    // Operative Class selection badges
    const classBadges = document.querySelectorAll('.class-badge');
    classBadges.forEach(badge => {
      badge.addEventListener('click', () => {
        classBadges.forEach(b => b.classList.remove('active'));
        badge.classList.add('active');
        this.game.selectedClass = badge.getAttribute('data-class') || 'commando';
      });
    });

    const btnBackToMenu = document.getElementById('btn-results-menu');
    if (btnBackToMenu) btnBackToMenu.addEventListener('click', () => this.showScreen('main_menu'));

    // Push-to-Talk key handlers
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyV' && !e.repeat && this.game.voiceClient) {
        this.game.voiceClient.setMicrophoneActive(true);
      }
      if (e.code === 'F3') {
        e.preventDefault();
        this.toggleDebugPanel();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyV' && this.game.voiceClient) {
        this.game.voiceClient.setMicrophoneActive(false);
      }
    });
  }

  showScreen(screenName) {
    this.currentScreen = screenName;
    document.getElementById('main-menu-screen')?.classList.toggle('hidden', screenName !== 'main_menu');
    document.getElementById('matchmaking-screen')?.classList.toggle('hidden', screenName !== 'lobby');
    document.getElementById('game-hud')?.classList.toggle('hidden', screenName !== 'game');
    document.getElementById('results-screen')?.classList.toggle('hidden', screenName !== 'results');
  }

  startMatchmaking(mode = 'multiplayer') {
    this.showScreen('lobby');
    const username = document.getElementById('input-player-name')?.value || 'Operative_' + Math.floor(Math.random() * 900 + 100);
    this.game.connectToServer(username, mode);
  }

  cancelMatchmaking() {
    this.game.disconnect();
    this.showScreen('main_menu');
  }

  updateLobbyStatus(data) {
    const realEl = document.getElementById('lobby-real-players');
    const botsEl = document.getElementById('lobby-bots-count');
    const totalEl = document.getElementById('lobby-total-count');
    const timerEl = document.getElementById('lobby-timer');
    const pingEl = document.getElementById('lobby-ping');

    if (realEl) realEl.textContent = data.realPlayers || 1;
    if (botsEl) botsEl.textContent = data.botsPlanned !== undefined ? data.botsPlanned : (150 - (data.realPlayers || 1));
    if (totalEl) totalEl.textContent = `${(data.realPlayers || 1) + (data.botsPlanned || 0)} / 150`;
    if (timerEl) {
      const mins = Math.floor((data.countdown || 0) / 60);
      const secs = (data.countdown || 0) % 60;
      timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (pingEl) pingEl.textContent = `${this.game.ping || 24} ms`;
  }

  updateSquadHUD(squadMembers = []) {
    const container = document.getElementById('squad-list');
    if (!container) return;
    container.innerHTML = '';

    squadMembers.forEach((member, i) => {
      const el = document.createElement('div');
      el.className = 'squad-member-item';
      el.innerHTML = `
        <span class="sq-marker sq-${i + 1}">●</span>
        <span class="sq-name">${member.name}</span>
        <span class="sq-dist">${Math.round(member.distance || 0)}m</span>
        <div class="sq-hp-bar"><div class="sq-hp-fill" style="width:${member.health}%"></div></div>
      `;
      container.appendChild(el);
    });
  }

  showMatchResults(stats) {
    this.showScreen('results');
    document.getElementById('res-placement').textContent = stats.placement ? `#${stats.placement}` : '#1 VICTORY';
    document.getElementById('res-kills').textContent = stats.kills || 0;
    document.getElementById('res-monster-kills').textContent = stats.monsterKills || 0;
    document.getElementById('res-xp').textContent = `+${stats.xp || 450} XP`;
    document.getElementById('res-time').textContent = `${Math.floor((stats.survivalTime || 120) / 60)}m ${(stats.survivalTime || 120) % 60}s`;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  renderClanLeaderboard(clans = []) {
    const tbody = document.querySelector('#clan-table-body tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    clans.forEach((c, idx) => {
      const row = document.createElement('tr');
      const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
      row.innerHTML = `
        <td class="${rankClass}">#${idx + 1}</td>
        <td><strong style="color: #38bdf8;">${c.tag}</strong> ${c.name}</td>
        <td><span class="region-badge">${c.region}</span></td>
        <td style="color: #ef4444; font-weight: bold;">WAVE ${c.highestHordeWave}</td>
        <td>${c.totalMutantsPurged.toLocaleString()}</td>
        <td style="color: #10b981; font-weight: bold;">${c.reputationScore.toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  }

  toggleDebugPanel() {
    const panel = document.getElementById('debug-telemetry-panel');
    if (panel) panel.classList.toggle('hidden');
  }

  updateDebugTelemetry(telemetry) {
    const panel = document.getElementById('debug-telemetry-panel');
    if (!panel || panel.classList.contains('hidden')) return;

    panel.innerHTML = `
      <div class="debug-title">DREXVIA NET ENGINE TELEMETRY</div>
      <div>FPS: <span class="val">${telemetry.fps || 60}</span></div>
      <div>PING: <span class="val">${telemetry.ping || 0} ms</span></div>
      <div>SERVER TICK: <span class="val">20 Hz (Authoritative)</span></div>
      <div>PARTICIPANTS: <span class="val">${telemetry.totalEntities || 150} / 150</span></div>
      <div>NEARBY BOTS: <span class="val">${telemetry.botsCount || 0}</span></div>
      <div>NEARBY PLAYERS: <span class="val">${telemetry.playersCount || 0}</span></div>
      <div>MONSTERS: <span class="val">${telemetry.monstersCount || 0}</span></div>
      <div>SECTOR: <span class="val">${telemetry.currentSector || 'Sector 01 Outpost'}</span></div>
      <div>WEATHER: <span class="val">${telemetry.weather || 'Foggy Storm'}</span></div>
      <div>MEM BUFFER: <span class="val">${telemetry.interpBuffer || 0} packets</span></div>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
}
