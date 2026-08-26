/**
 * DREXVIA - Authoritative 150-Player Survival Horror Server
 * Developer: Soumya Chunary Studios
 */

const http = require('http');
const path = require('path');
const express = require('express');
const { WebSocketServer } = require('ws');

const { CONFIG, NET_MESSAGES, WEAPONS } = require('../../shared/constants');
const Matchmaker = require('./matchmaker');
const BotEngine = require('./bot_engine');
const WorldManager = require('./world_manager');
const VoiceSignaling = require('./voice_signaling');
const PersistenceManager = require('./persistence');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static standalone web client and assets
app.use(express.static(path.join(__dirname, '../../web')));
app.use('/shared', express.static(path.join(__dirname, '../../shared')));
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    game: CONFIG.GAME_NAME,
    developer: CONFIG.DEVELOPER,
    maxPlayers: CONFIG.MAX_PLAYERS,
    timestamp: Date.now()
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const matchmaker = new Matchmaker(wss);
const voiceSignaling = new VoiceSignaling();
const persistence = new PersistenceManager();

const activeMatches = new Map(); // matchId -> { world, bots, players, tickInterval }

matchmaker.onMatchReady = (lobby, botsNeeded) => {
  const matchId = lobby.id;
  const world = new WorldManager(matchId);
  const botEngine = new BotEngine(world);
  const spawnedBots = botEngine.spawnBots(botsNeeded, matchId);

  const matchData = {
    id: matchId,
    world: world,
    botEngine: botEngine,
    players: new Map(lobby.realPlayers),
    bots: spawnedBots,
    startTime: Date.now(),
    isLive: true
  };

  activeMatches.set(matchId, matchData);

  // Notify connected players
  for (const player of lobby.realPlayers.values()) {
    if (player.ws && player.ws.readyState === 1) {
      player.ws.send(JSON.stringify({
        type: NET_MESSAGES.S_MATCH_START,
        matchId: matchId,
        squadId: player.squadId,
        totalParticipants: CONFIG.MAX_PLAYERS,
        realPlayersCount: lobby.realPlayers.size,
        botCount: botsNeeded,
        spawnPosition: player.position || { x: 0, y: 0.9, z: 0 }
      }));
    }
  }

  // Authoritative match loop at 20Hz
  matchData.tickInterval = setInterval(() => {
    runMatchTick(matchData);
  }, 1000 / CONFIG.SERVER_TICK_RATE);
};

function runMatchTick(match) {
  const delta = 1.0 / CONFIG.SERVER_TICK_RATE;

  const allAliveEntities = [
    ...Array.from(match.players.values()),
    ...match.botEngine.bots.values()
  ];

  // 1. Update World & Monsters
  match.world.update(delta, allAliveEntities);

  // 2. Update AI Bots
  match.botEngine.update(delta, Array.from(match.players.values()), Array.from(match.world.monsters.values()));

  // 3. Send spatial updates to real players
  for (const player of match.players.values()) {
    if (!player.ws || player.ws.readyState !== 1) continue;

    // Filter interest entities within radius
    const nearbyBots = [];
    const nearbyOtherPlayers = [];

    for (const bot of match.botEngine.bots.values()) {
      if (!bot.isAlive) continue;
      const dx = bot.position.x - player.position.x;
      const dz = bot.position.z - player.position.z;
      if (Math.sqrt(dx * dx + dz * dz) <= CONFIG.INTEREST_RADIUS) {
        nearbyBots.push({
          id: bot.id,
          name: bot.name,
          pos: bot.position,
          yaw: bot.rotation.yaw,
          health: bot.health,
          weapon: bot.currentWeapon,
          state: bot.state,
          isBot: true
        });
      }
    }

    for (const other of match.players.values()) {
      if (other.id === player.id || !other.isAlive) continue;
      const dx = other.position.x - player.position.x;
      const dz = other.position.z - player.position.z;
      if (Math.sqrt(dx * dx + dz * dz) <= CONFIG.INTEREST_RADIUS) {
        nearbyOtherPlayers.push({
          id: other.id,
          name: other.name,
          pos: other.position,
          yaw: other.rotation.yaw,
          health: other.health,
          weapon: other.currentWeapon,
          squadId: other.squadId,
          isBot: false
        });
      }
    }

    const worldSnapshot = match.world.getSpatialSnapshot(player.position);

    player.ws.send(JSON.stringify({
      type: NET_MESSAGES.S_SPATIAL_ENTITIES,
      players: nearbyOtherPlayers,
      bots: nearbyBots,
      monsters: worldSnapshot.monsters,
      loot: worldSnapshot.loot,
      worldTime: worldSnapshot.worldTime,
      weather: worldSnapshot.weather,
      serverTime: Date.now()
    }));
  }
}

wss.on('connection', (ws) => {
  const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
  let playerSession = {
    id: playerId,
    name: 'Operative_' + playerId.substring(7, 11),
    ws: ws,
    position: { x: 0, y: 0.9, z: 0 },
    rotation: { yaw: 0, pitch: 0 },
    health: 100,
    maxHealth: 100,
    armor: 50,
    isAlive: true,
    currentWeapon: 'rifle',
    kills: 0,
    monsterKills: 0,
    bossesDefeated: 0,
    matchId: null,
    squadId: null,
    takeDamage: (amount, attackerId) => {
      playerSession.health = Math.max(0, playerSession.health - amount);
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: NET_MESSAGES.S_PLAYER_DAMAGED,
          health: playerSession.health,
          damage: amount,
          attackerId: attackerId
        }));
      }
    }
  };

  ws.send(JSON.stringify({
    type: NET_MESSAGES.S_WELCOME,
    playerId: playerId,
    name: playerSession.name,
    config: CONFIG
  }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      handleClientMessage(playerSession, msg);
    } catch (e) {
      console.error('[DREXVIA SERVER] Invalid packet', e);
    }
  });

  ws.on('close', () => {
    matchmaker.removePlayer(playerId);
    voiceSignaling.removePeer(playerId);
    if (playerSession.matchId && activeMatches.has(playerSession.matchId)) {
      const match = activeMatches.get(playerSession.matchId);
      match.players.delete(playerId);
    }
  });
});

function handleClientMessage(player, msg) {
  switch (msg.type) {
    case NET_MESSAGES.C_JOIN_QUEUE: {
      if (msg.username) player.name = msg.username;
      const queueInfo = matchmaker.addPlayerToQueue(player);
      voiceSignaling.registerPeer(player.id, player.ws, player.squadId, player.matchId);
      player.ws.send(JSON.stringify({
        type: NET_MESSAGES.S_LOBBY_UPDATE,
        ...queueInfo
      }));
      break;
    }

    case NET_MESSAGES.C_INPUT_MOVE: {
      if (msg.position) {
        // Basic speed anti-cheat validation
        const dx = msg.position.x - player.position.x;
        const dz = msg.position.z - player.position.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < 15 * 15) { // Sanity check max velocity per tick
          player.position = msg.position;
        }
      }
      if (msg.rotation) player.rotation = msg.rotation;
      voiceSignaling.updatePeerPosition(player.id, player.position);
      break;
    }

    case NET_MESSAGES.C_WEAPON_FIRE: {
      if (!player.matchId || !activeMatches.has(player.matchId)) return;
      const match = activeMatches.get(player.matchId);
      const wep = WEAPONS[msg.weaponId] || WEAPONS.rifle;

      // Authoritative Hitscan / Damage Resolution
      if (msg.hitTargetId) {
        if (msg.targetType === 'bot') {
          const killed = match.botEngine.damageBot(msg.hitTargetId, wep.damage, player.id);
          if (killed) {
            player.kills++;
            persistence.awardMatchStats(player.name, { kills: 1, survivalTime: 0 });
          }
        } else if (msg.targetType === 'monster' && match.world.monsters.has(msg.hitTargetId)) {
          const mob = match.world.monsters.get(msg.hitTargetId);
          mob.health -= wep.damage;
          if (mob.health <= 0) {
            mob.isAlive = false;
            player.monsterKills++;
            if (mob.isBoss) player.bossesDefeated++;
          }
        }
      }
      break;
    }

    case NET_MESSAGES.C_VOICE_SIGNAL: {
      voiceSignaling.handleSignal(player.id, msg);
      break;
    }

    case NET_MESSAGES.C_ENTER_VEHICLE: {
      if (!player.matchId || !activeMatches.has(player.matchId)) return;
      const match = activeMatches.get(player.matchId);
      const res = match.world.enterVehicle(msg.vehicleId, player.id);
      player.ws.send(JSON.stringify({
        type: NET_MESSAGES.S_VEHICLE_STATE,
        action: 'enter_result',
        success: res.success,
        seat: res.seat,
        vehicleId: msg.vehicleId
      }));
      break;
    }

    case NET_MESSAGES.C_EXIT_VEHICLE: {
      if (!player.matchId || !activeMatches.has(player.matchId)) return;
      const match = activeMatches.get(player.matchId);
      match.world.exitVehicle(msg.vehicleId, player.id);
      player.ws.send(JSON.stringify({
        type: NET_MESSAGES.S_VEHICLE_STATE,
        action: 'exit_result',
        vehicleId: msg.vehicleId
      }));
      break;
    }

    case NET_MESSAGES.C_INPUT_VEHICLE: {
      if (!player.matchId || !activeMatches.has(player.matchId)) return;
      const match = activeMatches.get(player.matchId);
      match.world.updateVehiclePhysics(msg.vehicleId, msg.input, 1.0 / CONFIG.SERVER_TICK_RATE);
      break;
    }

    case NET_MESSAGES.C_GET_CLAN_LEADERBOARD: {
      const clans = persistence.getClanLeaderboard();
      player.ws.send(JSON.stringify({
        type: NET_MESSAGES.S_CLAN_LEADERBOARD,
        clans: clans
      }));
      break;
    }

    case NET_MESSAGES.C_SUBMIT_HORDE_SCORE: {
      const updated = persistence.submitHordeWave(player.name, msg.clanTag || '[SCS]', msg.waveReached || 1, msg.mutantsKilled || 0);
      player.ws.send(JSON.stringify({
        type: NET_MESSAGES.S_CLAN_LEADERBOARD,
        clans: updated
      }));
      break;
    }

    case NET_MESSAGES.C_PING: {
      player.ws.send(JSON.stringify({ type: NET_MESSAGES.S_PONG, timestamp: msg.timestamp }));
      break;
    }
  }
}

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  DREXVIA - Standalone Multiplayer Survival Horror Server`);
  console.log(`  Developer: ${CONFIG.DEVELOPER}`);
  console.log(`  Max Players: ${CONFIG.MAX_PLAYERS} (Players + AI Bots)`);
  console.log(`  Server Listening on port: ${PORT}`);
  console.log(`=======================================================`);
});
