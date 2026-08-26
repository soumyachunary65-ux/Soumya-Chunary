/**
 * DREXVIA - Matchmaking & Lobby Engine
 * Developer: Soumya Chunary Studios
 */

const { CONFIG, BOT_PERSONALITIES } = require('../../shared/constants');

class Matchmaker {
  constructor(ioOrWsServer) {
    this.server = ioOrWsServer;
    this.lobbies = new Map(); // matchId -> MatchInstance
    this.currentLobby = this.createNewLobby();
  }

  createNewLobby() {
    const lobbyId = 'drexvia_match_' + Math.random().toString(36).substring(2, 9);
    const lobby = {
      id: lobbyId,
      state: 'WAITING', // 'WAITING', 'COUNTDOWN', 'IN_GAME', 'ENDED'
      createdAt: Date.now(),
      countdownRemaining: CONFIG.MATCHMAKING_TIME,
      maxPlayers: CONFIG.MAX_PLAYERS,
      realPlayers: new Map(), // playerId -> PlayerSession
      squads: new Map(), // squadId -> [playerId, ...]
      bots: [],
      matchInstance: null
    };
    this.lobbies.set(lobbyId, lobby);
    return lobby;
  }

  addPlayerToQueue(player) {
    let lobby = this.currentLobby;
    if (lobby.state === 'IN_GAME' || lobby.realPlayers.size >= lobby.maxPlayers) {
      this.currentLobby = this.createNewLobby();
      lobby = this.currentLobby;
    }

    lobby.realPlayers.set(player.id, player);
    player.matchId = lobby.id;

    // Assign to squad (4 players per squad)
    let assignedSquad = null;
    for (const [squadId, members] of lobby.squads.entries()) {
      if (members.length < CONFIG.SQUAD_SIZE) {
        members.push(player.id);
        assignedSquad = squadId;
        break;
      }
    }

    if (!assignedSquad) {
      assignedSquad = 'squad_' + (lobby.squads.size + 1);
      lobby.squads.set(assignedSquad, [player.id]);
    }
    player.squadId = assignedSquad;

    // Start countdown if we have players
    if (lobby.state === 'WAITING' && lobby.realPlayers.size >= 1) {
      this.startCountdown(lobby);
    }

    return {
      lobbyId: lobby.id,
      squadId: player.squadId,
      playerCount: lobby.realPlayers.size,
      maxPlayers: lobby.maxPlayers,
      countdown: lobby.countdownRemaining
    };
  }

  removePlayer(playerId) {
    for (const lobby of this.lobbies.values()) {
      if (lobby.realPlayers.has(playerId)) {
        lobby.realPlayers.delete(playerId);
        // Remove from squad
        for (const [squadId, members] of lobby.squads.entries()) {
          const idx = members.indexOf(playerId);
          if (idx !== -1) members.splice(idx, 1);
        }
        return lobby;
      }
    }
    return null;
  }

  startCountdown(lobby) {
    if (lobby.state === 'COUNTDOWN') return;
    lobby.state = 'COUNTDOWN';

    lobby.timerInterval = setInterval(() => {
      lobby.countdownRemaining--;

      // Broadcast countdown update
      this.broadcastLobbyUpdate(lobby);

      if (lobby.countdownRemaining <= 0) {
        clearInterval(lobby.timerInterval);
        this.launchMatch(lobby);
      }
    }, 1000);
  }

  broadcastLobbyUpdate(lobby) {
    const realCount = lobby.realPlayers.size;
    const botsCount = CONFIG.BOT_FILL_ENABLED ? (CONFIG.MAX_PLAYERS - realCount) : 0;

    const payload = {
      type: 's_lobby_update',
      lobbyId: lobby.id,
      realPlayers: realCount,
      botsPlanned: botsCount,
      totalParticipants: CONFIG.MAX_PLAYERS,
      countdown: lobby.countdownRemaining,
      state: lobby.state
    };

    for (const player of lobby.realPlayers.values()) {
      if (player.ws && player.ws.readyState === 1) {
        player.ws.send(JSON.stringify(payload));
      }
    }
  }

  launchMatch(lobby) {
    lobby.state = 'IN_GAME';
    const realCount = lobby.realPlayers.size;
    const botsNeeded = CONFIG.BOT_FILL_ENABLED ? (CONFIG.MAX_PLAYERS - realCount) : 0;

    console.log(`[DREXVIA MATCHMAKER] Launching match ${lobby.id} with ${realCount} real players and ${botsNeeded} AI Bots (Total: ${CONFIG.MAX_PLAYERS})`);

    // Prepare fresh queue for subsequent players
    if (this.currentLobby.id === lobby.id) {
      this.currentLobby = this.createNewLobby();
    }

    if (this.onMatchReady) {
      this.onMatchReady(lobby, botsNeeded);
    }
  }
}

module.exports = Matchmaker;
